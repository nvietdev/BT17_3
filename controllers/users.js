let userSchema = require('../models/users');
let roleSchema = require('../models/roles');
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let constants = require('../Utils/constants')


module.exports = {
    getUserById: async function(id){
        return await userSchema.findById(id);
    },
    createUser:async function(username,password,email,role){
        let roleCheck = await roleSchema.findOne({roleName:role});
        if(roleCheck){
            let newUser = new userSchema({
                username: username,
                password: password,
                email: email,
                role: roleCheck._id,
            });
            await newUser.save();    
            return newUser;  
        }else{    
            throw new Error("role khong ton tai");
        }

    },
    checkLogin: async function(username,password){
        if(username&&password){
            let user = await userSchema.findOne({
                username:username
            })
            if(user){
                if(bcrypt.compareSync(password,user.password)){
                    return jwt.sign({
                        id:user._id,
                        expired:new Date(Date.now()+30*60*1000)
                    },constants.SECRET_KEY);
                }else{
                    throw new Error("username or password is incorrect")
                }
            }else{
                throw new Error("username or password is incorrect")
            }
        }else{
            throw new Error("username or password is incorrect")
        }
    },
    resetPassword: async function(userId, adminUser) {
        // Kiểm tra xem người dùng hiện tại có phải admin không
        let adminRole = await roleSchema.findOne({roleName: 'admin'});
        if (!adminRole || adminUser.role.toString() !== adminRole._id.toString()) {
            throw new Error("Bạn không có quyền reset mật khẩu");
        }

        let user = await userSchema.findById(userId);
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }

        user.password = "123456";
        await user.save();
        return user;
    },
    changePassword: async function(userId, currentPassword, newPassword) {
        let user = await userSchema.findById(userId);
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }

        // Kiểm tra mật khẩu hiện tại
        if (!bcrypt.compareSync(currentPassword, user.password)) {
            throw new Error("Mật khẩu hiện tại không đúng");
        }

        user.password = newPassword;
        await user.save();
        return user;
    }
}