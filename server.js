const grpc = require('@grpc/grpc-js');
const const_module = require('./const');
const emailModule = require('./email');
const message_proto = require('./proto')

async function GetVerifyCode(call, callback) {
    console.log("email is ", call.request.email)
    try{
        // 改为动态导入方式
        const { v4: uuidv4 } = await import('uuid');
        uniqueId = uuidv4(); //生成验证码

        console.log("uniqueId is ", uniqueId)
        let text_str =  '您的验证码为'+ uniqueId +'请三分钟内完成注册'

        //发送邮件
        let mailOptions = {
            from: 'qq2098175996@163.com',
            to: call.request.email,
            subject: '验证码',
            text: text_str,
        };

        let send_res = await emailModule.SendMail(mailOptions);
        console.log("send res is ", send_res)

        //返回grpc客户端
        callback(null, { 
            email: call.request.email,
            error: const_module.Errors.Success
        }); 

    }catch(error){
        console.log("catch error is ", error)
        
        //返回grpc客户端
        callback(null, { 
            email: call.request.email,
            error: const_module.Errors.Exception
        }); 
    }
}

function main() {
    var server = new grpc.Server()
    server.addService(message_proto.VerifyService.service, { GetVerifyCode: GetVerifyCode })
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        server.start()
        console.log('grpc server started')        
    })
}

main()
