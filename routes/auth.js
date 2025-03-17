var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
const { check_authentication } = require('../Utils/check_auth');

router.post('/signup', async function(req, res, next) {
    try {
        let body = req.body;
        let result = await userController.createUser(
          body.username,
          body.password,
          body.email,
         'user'
        )
        res.status(200).send({
          success:true,
          data:result
        })
      } catch (error) {
        next(error);
      }

})
router.post('/login', async function(req, res, next) {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let result = await userController.checkLogin(username,password);
        res.status(200).send({
            success:true,
            data:result
        })
      } catch (error) {
        next(error);
      }

})
router.get('/me',check_authentication, async function(req, res, next){
    try {
      res.status(200).send({
        success:true,
        data:req.user
    })
    } catch (error) {
        next();
    }
})

// Reset password route - chỉ admin mới có quyền
router.get('/resetPassword/:id', check_authentication, async function(req, res, next) {
    try {
        let result = await userController.resetPassword(req.params.id, req.user);
        res.status(200).send({
            success: true,
            message: "Đã reset mật khẩu thành công"
        });
    } catch (error) {
        next(error);
    }
});

// Change password route - người dùng đã đăng nhập
router.post('/changePassword', check_authentication, async function(req, res, next) {
    try {
        let { password, newpassword } = req.body;
        let result = await userController.changePassword(req.user._id, password, newpassword);
        res.status(200).send({
            success: true,
            message: "Đã đổi mật khẩu thành công"
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router