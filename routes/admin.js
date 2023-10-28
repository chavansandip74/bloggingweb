var express = require("express");
var router = express.Router();
var exe = require("./connection");
router.use(express.static("public/"));

router.get("/", async function (req, res) {
    if (req.session.admin_id == undefined) {
        res.redirect("/admin/login");
    }
    else {
        var year = new Date().getFullYear();
        var jan_data = await exe(`select COUNT(blog_id) as ttl from blogs where blog_date like '${year}-01-%'`);
        var feb_data = await exe(`select COUNT(blog_id) as ttl from blogs where blog_date like '${year}-02-%'`);
        var mar_data = await exe(`select COUNT(blog_id) as ttl from blogs where blog_date like '${year}-03-%'`);
        var apr_data = await exe(`select COUNT(blog_id) as ttl from blogs where blog_date like '${year}-04-%'`);
        var may_data = await exe(`select COUNT(blog_id) as ttl from blogs where blog_date like '${year}-05-%'`);
        var june_data = await exe(`select COUNT(blog_id) as ttl from blogs where blog_date like '${year}-06-%'`);
        var jule_data = await exe(`select COUNT(blog_id) as ttl from blogs where blog_date like '${year}-07-%'`);
        var aug_data = await exe(`select COUNT(blog_id) as ttl from blogs where blog_date like '${year}-08-%'`);
        var sep_data = await exe(`select COUNT(blog_id) as ttl from blogs where blog_date like '${year}-09-%'`);
        var oct_data = await exe(`select COUNT(blog_id) as ttl from blogs where blog_date like '${year}-10-%'`);
        var nov_data = await exe(`select COUNT(blog_id) as ttl from blogs where blog_date like '${year}-11-%'`);
        var dec_data = await exe(`select COUNT(blog_id) as ttl from blogs where blog_date like '${year}-12-%'`);

        var obj = {
            'jan': jan_data[0].ttl, 'feb': feb_data[0].ttl, 'mar': mar_data[0].ttl, 'apr': apr_data[0].ttl, 'may': may_data[0].ttl, 'june': june_data[0].ttl,
            'jule': jule_data[0].ttl, 'aug': aug_data[0].ttl, 'sep': sep_data[0].ttl, 'oct': oct_data[0].ttl, 'nov': nov_data[0].ttl, 'dec': dec_data[0].ttl,
        };
        res.render("admin/ahome.ejs", obj);
    }
});
router.get("/userlist", async function (req, res) {
    var data = await exe(`select * from user `);
    var data1 = await exe(`SELECT user.user_id, COUNT(blogs.blog_id) AS cnt
    FROM user
    LEFT JOIN blogs ON user.user_id = blogs.user_id
    GROUP BY user.user_id;`);
    var data3 = await exe(`SELECT COUNT(*) AS countblog FROM blogs;`);
    var obj = { "user": data, "blog": data1, "cb": data3[0] }
    res.render("admin/user.ejs", obj)
});
router.get("/delete_user/:admin_id", async function (req, res) {

    var id = req.params.admin_id;
    await exe(`DELETE FROM user where user_id='${id}'`);
    res.send(`
    <script>
      alert('User  Deleted Successfully ');
      location.href="/admin/userlist";
    </script>
    `);
});
router.get("/aprofile", async function (req, res) {
    var data = await exe(`select * from admin `);
    var obj = { "admin": data }
    res.render("admin/profile.ejs", obj)
});
router.get("/edit_admin/:admin_id", async function (req, res) {

    var id = req.params.admin_id;
    var data = await exe(`SELECT * FROM admin where admin_id='${id}'`);
    var obj = { "admin": data[0] };
    res.render("admin/edit_admin.ejs", obj);
});
router.post("/update_admin/:admin_id", async function (req, res) {
    var id = req.params.admin_id;
    var d = req.body;
    await exe(`UPDATE admin SET admin_name='${d.admin_name}',admin_email='${d.admin_email}',admin_password='${d.admin_password}' WHERE 
    admin_id='${id}'`);
    res.send(`
    <script>
      alert('Admin Update Successfully ');
      location.href="/admin/aprofile";
    </script>
    `);



});
router.get("/delete_admin/:admin_id", async function (req, res) {

    var id = req.params.admin_id;
    await exe(`DELETE FROM admin where admin_id='${id}'`);
    res.send(`
    <script>
      alert('Admin Deleted Successfully ');
      location.href="/admin/aprofile";
    </script>
    `);
});
router.get("/umassage", async function (req, res) {
    var data = await exe(`select * from user_massage `);
    var obj = { "user": data }
    res.render("admin/amassage.ejs", obj)
})
router.get("/delete_massage/:admin_id", async function (req, res) {

    var id = req.params.admin_id;
    await exe(`DELETE FROM user_massage where user_id='${id}'`);
    res.send(`
    <script>
      alert('User massage Deleted Successfully ');
      location.href="/admin/umassage";
    </script>
    `);
});
router.get("/apost", async function (req, res) {
    var data = await exe(`select * from blogs `);
    var data2 = await exe(`SELECT b.blog_id, c.user_name, c.user_comment
    FROM blogs b
    LEFT JOIN comment c ON b.blog_id = c.blog_id;`);
    var data3 = await exe(`SELECT b.blog_id, b.blog_title, COUNT(l.like_id) as like_count
    FROM blogs b
    LEFT JOIN likes l ON b.blog_id = l.blog_id
    GROUP BY b.blog_id, b.blog_title;
    
    `);
    var obj = { "blogs": data, "cm": data2, "likes": data3 }


    res.render("admin/apost.ejs", obj)
});
router.get("/delete_blog/:blog_id", async function (req, res) {

    var id = req.params.blog_id;
    await exe(`DELETE FROM blogs where blog_id='${id}'`);
    res.send(`
    <script>
      alert('blog Deleted Successfully ');
      location.href="/admin/apost";
    </script>
    `);
});
router.get("/login", async function (req, res) {
    res.render("admin/login.ejs");
});
router.post("/admin_login_process", async function (req, res) {
    var sql = `select * from admin where admin_name='${req.body.admin_name}' and admin_password='${req.body.admin_password}'`;
    var data = await exe(sql);
    if (data.length > 0) {
        req.session.admin_id = data[0].admin_id;
        res.redirect("/admin");
    }
    else {
        res.send(`
        <script>
          alert('Admin Login Fail ');
          location.href="/admin/login";
        </script>
        `);
    }
    // res.send(data);
    // res.send(req.body);
});







module.exports = router;