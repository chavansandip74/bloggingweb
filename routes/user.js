var express = require("express");
var router = express.Router();
var exe = require("./connection");
router.use(express.static("public/"));
function login(req) {
   if (req.session.user_id == undefined)
      return false;
   else
      return true;
}
router.get("/", async function (req, res) {
   var data = await exe(`select * from blogs`);
   var data2 = await exe(`SELECT b.blog_id, c.user_name, c.user_comment
   FROM blogs b
   LEFT JOIN comment c ON b.blog_id = c.blog_id;`);
   var data3 = await exe(`SELECT b.blog_id, b.blog_title, COUNT(l.like_id) as like_count
   FROM blogs b
   LEFT JOIN likes l ON b.blog_id = l.blog_id
   GROUP BY b.blog_id, b.blog_title;
   
   `);
   var obj = { "blogs": data, "cm": data2, "likes": data3 }
   res.render("user/home.ejs", obj)
});
router.get("/blog", async function (req, res) {

   res.render("user/blog.ejs");
});
router.post("/save_blog", async function (req, res) {
   if (login(req)) {
      const today = new Date();
      var time = today.getTime();
      var filename = time + req.files.blog_img.name;
      req.files.blog_img.mv("public/uploads/" + filename);
      console.log(req.files);

      //  await exe(`create table blogs(blog_id int primary key auto_increment ,user_id int,blog_title varchar(50),author_name varchar(50),
      //    blog_img text,blog_type text,blog_date date,blog_link text,blog_content text )`);
      await exe(`insert into blogs(user_id,blog_title,author_name,blog_img,blog_type,blog_date,blog_link,blog_content)values
    ('${req.session.user_id}','${req.body.blog_title}','${req.body.author_name}','${filename}','${req.body.blog_type}','${req.body.blog_date}','${req.body.blog_link}','${req.body.blog_content}')`);
      console.log(req.body)
      res.send(`
   <script>
      alert('blog create Successfully');
      location.href="/blog";
   </script>
 `);


   }
   else {
      res.send(`
<script>
  alert('login First');
     location.href="/login";
 </script>
 `);
   }
});
router.get("/delete_blog/:blog_id", async function (req, res) {
   if (login(req)) {
      var id = req.params.blog_id;
      await exe(`DELETE FROM blogs where blog_id='${id}'`);
      res.send(`
   <script>
     alert('blog Deleted Successfully ');
     location.href="/blog";
   </script>
   `);
   }
   else {
      res.send(`
      <script>
         alert('login First');
         location.href="/login";
      </script>
    `);
   }

});
router.get("/pages", async function (req, res) {

   res.render("user/pages.ejs");
});
router.get("/post", async function (req, res) {
   if (login(req)) {
      var data = await exe(`select * from blogs where user_id='${req.session.user_id}'`);
      var data2 = await exe(`SELECT b.blog_id, c.user_name, c.user_comment
   FROM blogs b
   LEFT JOIN comment c ON b.blog_id = c.blog_id;`);
      var data3 = await exe(`SELECT b.blog_id, b.blog_title, COUNT(l.like_id) as like_count
   FROM blogs b
   LEFT JOIN likes l ON b.blog_id = l.blog_id
   GROUP BY b.blog_id, b.blog_title;
   
   `);
      var obj = { "blogs": data, "cm": data2, "likes": data3 }
      res.render("user/post.ejs", obj);
   }
   else {
      res.send(`
      <script>
         alert('login First');
         location.href="/login";
      </script>
    `);
   }

});
router.get("/contact", async function (req, res) {
   if (login(req)) {
      var data = await exe(`select * from user where user_id='${req.session.user_id}'`);
      var obj = { "user": data[0] }
      res.render("user/contact.ejs", obj);
   }
   else {
      res.send(`
      <script>
         alert('login First');
         location.href="/login";
      </script>
    `);
   }
});
router.post("/umassage", async function (req, res) {
   if (login(req)) {
      var user_id = req.session.user_id;
      // await exe(`create table user_massage(user_id int primary key auto_increment,user_name varchar(200),user_mobile varchar(15),
      //   user_email varchar(200),user_massage text)`);
      var users = await exe(`insert into user_massage(user_id,user_name,user_mobile,
      user_email,user_massage) values 
     ('${user_id}','${req.body.user_name}','${req.body.user_mobile}','${req.body.user_email}','${req.body.user_massage}')`);
      res.send(`<script>
    alert('Massage Send Successfully');
   location.href="/contact";
  </script>`);
   }
   else {
      res.send(`
         <script>
            alert('login First');
            location.href="/login";
         </script>
       `);
   }

});
router.get("/login", async function (req, res) {

   res.render("user/login.ejs");
});
router.get("/profile", async function (req, res) {
   if (login(req)) {
      var data = await exe(`select * from user where user_id='${req.session.user_id}'`);
      var obj = { "user": data[0] }
      res.render("user/profile.ejs", obj);
   }
   else {
      res.send(`
      <script>
         alert('login First');
         location.href="/login";
      </script>
    `);
   }
});
router.get("/register", async function (req, res) {

   res.render("user/register.ejs");
});
router.post("/save_user", async function (req, res) {
   // await exe(`create table user(user_id int primary key auto_increment,user_name varchar(200),user_mobile varchar(15),
   //  user_email varchar(200),user_password varchar(200))`);
   var users = await exe(`insert into user(user_name,user_mobile,
     user_email,user_password) values 
     ('${req.body.user_name}','${req.body.user_mobile}','${req.body.user_email}','${req.body.user_password}')`);
   res.redirect("/login");
});
router.post("/do_login", async function (req, res) {
   var data = await exe(`select * from user where user_mobile='${req.body.user_mobile}' and user_password='${req.body.user_password}'`);
   if (data.length > 0) {
      req.session.user_id = data[0].user_id;
      //res.send("Login Process Start");
      res.redirect("/");
   }
   else
      res.send(`<script>
          alert('login Fail');
         location.href="/login";
        </script>`);
});

router.get("/edit_user/", async function (req, res) {

   var data = await exe(`SELECT * FROM user where user_id='${req.session.user_id}'`);
   var obj = { "user": data[0] };
   res.render("user/edit_user.ejs", obj);
});
router.post("/update_user", async function (req, res) {
   var id = req.session.user_id;
   var d = req.body;
   await exe(`UPDATE user SET user_name='${d.user_name}',user_email='${d.user_email}',user_password='${d.user_password}' WHERE 
   user_id='${id}'`);
   res.send(`
   <script>
     alert('User Update Successfully ');
     location.href="/profile";
   </script>
   `);


});
router.get("/delete_user", async function (req, res) {

   var id = req.session.user_id;
   await exe(`DELETE FROM user where user_id='${id}'`);
   res.send(`
   <script>
     alert('User Deleted Successfully ');
     location.href="/profile";
   </script>
   `);
});
router.post("/comment/:blog_id", async function (req, res) {
   if (login(req)) {
      var blog_id = req.params.blog_id;
      var data = await exe(`select user_name from user where user_id='${req.session.user_id}'`);
      var user_name = data[0].user_name;
      //  await exe(`create table comment(comment_id int primary key auto_increment,user_id int,blog_id int,
      //   user_name varchar(200),user_comment text)`);
      await exe(`insert into comment(user_id,blog_id,user_name,user_comment) values 
     ('${req.session.user_id}','${blog_id}','${user_name}','${req.body.comment}')`);
      res.send(`<script>
   alert('comment Send it');
  location.href="/";
 </script>`);
   }
   else {
      res.send(`
      <script>
         alert('login First');
         location.href="/login";
      </script>
    `);
   }

});

router.post("/like/:blog_id", async function (req, res) {
   if (login(req)) {
      const user_id = req.session.user_id;
      const blog_id = req.params.blog_id;
      const existingLike = await exe("SELECT like_id FROM likes WHERE user_id = ? AND blog_id = ?", [user_id, blog_id]);

      if (!existingLike.length) {
         await exe("INSERT INTO likes (user_id, blog_id) VALUES (?, ?)", [user_id, blog_id]);
         res.send(`
           <script>
               alert('You liked it');
               location.href = "/";
           </script>
       `);
      } else {
         res.send(`
           <script>
               alert('You have already liked this');
               location.href = "/";
           </script>
       `);
      }
   }
   else {
      res.send(`
         <script>
            alert('login First');
            location.href="/login";
         </script>
       `);
   }
});




module.exports = router;