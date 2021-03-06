//获取传递过来的localStorage
var id = window.localStorage.getItem('id')
var sign_str = window.localStorage.getItem('sign_str')
var username = window.localStorage.getItem('username')
var nikename = window.localStorage.getItem('nickname')
var all_net = obj = JSON.parse(window.localStorage.getItem("all_net"))


var isclick = false;
//------------------------------------------------右边隐藏界面--------------------------------------------------------------
$(".icon-shizicha").click(function () {
    $(".icon-shizicha").toggleClass("shizi_isclicked")
    // $(".hidden_rigth").toggleClass("hidden_rigth_display")
    if(!isclick){
        $(".hidden_rigth").css({"width":"2rem","height":"2.5rem"});
        isclick = true;
        var timer = setInterval(function(){
            $(".hidden_rigth").css({"overflow":"initial"})
            clearInterval(timer)
        },400)
    }else{
        $(".hidden_rigth").css({"width":"0","height":"0","overflow":"hidden"});
        isclick = false;
    }
    
})
//申请好友
$(".add_btn").click(function () {

    //申请好友
    $.ajax({
        url: all_net.addFriend_net,
        type: "POST",
        data: {
            sign_str: sign_str,
            user_id: id,
            friend_user_id: $(".add_input").val()
        },
        datatype: "JSON",
        success: (function (msg) {
            
            if (!msg.msg){
                var M = {}
                if (M.dialog1) {
                    return M.dialog1.show();
                }
                M.dialog1 = jqueryAlert({
                    'content': "请输入正确的ID",
                    'closeTime': 3000,
                    'end': function () {
                    }
                })
                return;
            }
            var M = {}
            if (M.dialog1) {
                return M.dialog1.show();
            }
            M.dialog1 = jqueryAlert({
                'content': msg.msg,
                'closeTime': 3000,
                'end': function () {
                }
            })
        }),
        err: (function (msg) {
            var M = {}
            if (M.dialog1) {
                return M.dialog1.show();
            }
            M.dialog1 = jqueryAlert({
                'content': msg.msg,
                'closeTime': 4000,
                'end': function () {
                }
            })
        })


    })
})

var M = {}
//------------------------------------------------聊天信息界面--------------------------------------------------------------
//长轮询
function longLoop(url, type, data, callback) {
    $.ajax({
        url: url,
        type: type,
        dataType: "json",
        timeout: 1000 * 20,
        data: data,
        success(data) {
            if (data.msg === "签名字符串已过期" || data.msg.includes("无效")) {
                if (M.dialog2) {
                    return M.dialog2.show();
                }
                M.dialog2 = jqueryAlert({
                    'content': '签名字符串已过期,请重新登陆！',
                    'modal': true,
                    'end': function () {
                    },
                    'buttons': {
                        '确定': function () {
                            parent.location.href = '../Login.html';
                            M.dialog2.close();
                        }
                    }
                })

            }
            callback(data)
        },
        error(data) {


        },
        complete() {
            longLoop(url, type, data, callback)
        }
    })
}
var notic_data = {
    sign_str: sign_str,
    user_id: id
}
var arr_id = []//存放发信息的id
longLoop(all_net.getMessages_net, "GET", notic_data, function (data) {
    // set_add_information(data.data)
    isloading = true;
    for (var i = 0; i < data.data.length; i++) {
        set_add_information(data.data[i])
    }
})
//添加消息的函数
function add_information(time, uname, head_logo, message, user_id) {
    uname = uname.replace(/</g,"&lt;").replace(/>/g,"&gt;")
    message = message.replace(/</g,"&lt;").replace(/>/g,"&gt;")
    $(".notice_area").html(function (n) {
        return `<div class="notice_infomation"  user_id=${user_id} >
                    <img src= "${all_net.headInner_net}${head_logo}" class="notice_uheadimg">
                    <div class="notice_left">
                        <div class="notice_information1">
                            <p class="uname">${uname}</p>
                            <p class="send_time" uname=${uname} user_id=${user_id} >${time}</p>
                        </div>
                        <div class="notice_container" uname=${uname} user_id=${user_id} >${message}</div>
                        <span class="notice_num" user_id=${user_id} >0</span>
                    </div>
                </div>`+ $(".notice_area").html()
    })
}
function set_add_information(arr_notice) {
    var time = arr_notice.message_send_time.match(/(\d\d:\d\d):\d\d/)[1]

    if (arr_id.includes(arr_notice.user_id)) {
        $(`.notice_num[user_id=${arr_notice.user_id}]`).html(function (n) {
            // 
            return parseInt($(`.notice_num[user_id=${arr_notice.user_id}]`).html())+1;
        })
        $(`.notice_num[user_id=${arr_notice.user_id}]`).css({ "display": "inline-block" });
        $(`.notice_container[user_id=${arr_notice.user_id}]`).html(arr_notice.message)
        $(`.send_time[user_id=${arr_notice.user_id}]`).html(time)

    } else {
        arr_id.push(arr_notice.user_id)
        add_information(time, arr_notice.nickname, arr_notice.head_logo, arr_notice.message, arr_notice.user_id)
        if(!isloading){
            $(`.notice_num[user_id=${arr_notice.user_id}]`).html("1");
        }
    }

    $(".notice_area").on("click", `.notice_infomation[user_id=${arr_notice.user_id}]`, function () {
        parent.location.href = '../html/chatpage.html'
        window.localStorage.setItem('friend_id', this.getAttribute("user_id"));
        window.localStorage.setItem('nick_name', arr_notice.nickname);
        window.localStorage.setItem("friend_head_log",arr_notice.head_logo)
    })
}

//获取好友列表
function get_friendlist(url, callback) {
    $.ajax({
        url: url,
        type: "GET",
        datatype: "json",
        data: {
            sign_str: sign_str,
            user_id: id,
        },
        success: (function (data) {
            callback(data)
        })
    })
}

//获取聊天记录
function getchatlist(user_id, sign_str, friend_id, callback) {
    $.ajax({
        url:all_net.getChatHistory_net,
        type:"GET",
        datatype:"json",
        data:{
            sign_str:sign_str,
            user_id:user_id,
            friend_id:friend_id
        },
        success: (function (msg) {
            callback(msg)
        }),
        error(msg) {
            
            
        }
    })
}

var isloading = false;
// 添加聊天记录到主页上
get_friendlist(all_net.getFriends_net,function (data) {
    // 
    var friend_list = data.data

    for (let i = 0; i < friend_list.length; i++) {
        getchatlist(id, sign_str, friend_list[i].user_id, function (data) {
            if (!data.data[0]) return;
            isloading = true;
            var data_list = {
                "message_send_time": "14:20:06", "nickname": friend_list[i].nickname, "user_id": friend_list[i].user_id,
                "head_logo": friend_list[i].head_logo, "message": data.data[0].message
            }
            arr_id.push(friend_list.user_id)
            // 
            set_add_information(data_list)
            $(".notice_area .notice_num").css({ "display": "none" });
        })
    }
})

// 搜索用户
//用户点击操作跳转到搜索用户界面
$(".search").click(function () {
    parent.location.href = '../html/search_all_user.html'
})


//------------------------------------------------个人信息界面--------------------------------------------------------------
//获取元素
var left_home = $(".left_home")
var left_le = $(".left_le")
var left_ri = $(".left_ri")
var avatar = $("#avatar")
var avatar2 = $("#avatar2")
var btn_file = $("#btn_file")
var btn_submit = $("#btn_submit")
var change_avatar = $(".change_avatar")
var backg = $(".backg")
var login_out_slider = $(".login_out_slider")
var login_out = $(".login_out")
var head_img = $(".head_img")

//获取大框宽度
var ri_width = -$(".left_home").width()
var ri_height = $(".left_home").height()

$("#avatar").css("top", ri_height / 14)
$("#avatar").css("left", -ri_width / 40)
$(".backg").children().eq(1).css("top", ri_height / 100 - 20)
$(".backg").children().eq(1).css("left", -ri_width / 4)


//点击滑出
$(".head_img").click(function () {
    left_home.css("left", "0")
})

//左滑隐藏
left_ri.click(function () {
    left_home.css("left", `${ri_width}px`)
    if(change_avatar.css("display")=="block"){
        avatar.click()
    }
})

//滑动效果
avatar.click(function () {
    change_avatar.slideToggle("slow")
})

//退出
login_out_slider.click(function () {
    parent.location.href = "../Login.html"
})

avatar2.click(function () {
    btn_file.click();
    btn_file.change(function () {
        avatar2.attr("src", URL.createObjectURL($(this)[0].files[0]));
    });
});

//获取用户头像
$.ajax({
    url: all_net.getHeadImg_net,
    type: 'GET',
    data: {
        username: username
    },
    success: function (msg) {
        var user_head_logo = msg.data[0].head_logo

        //获取的数据显示到页面
        avatar.attr("src", all_net.headInner_net + user_head_logo)
        avatar2.attr("src", all_net.headInner_net + user_head_logo)
        head_img.attr("src", all_net.headInner_net + user_head_logo)
        backg.children().eq(1).children().eq(0).children().empty().append(username)
        backg.children().eq(1).children().eq(1).children().empty().append(nikename)
        backg.children().eq(1).children().eq(2).children().empty().append(id)

        //上传图片
        btn_submit.click(function () {
            var btn_file_val = btn_file.val()
            var hzm = btn_file_val.substr(btn_file_val.indexOf(".") + 1)

            if (btn_file_val == "") {
                alert("亲，您未选择任何图片哦")
            }
            // else if (hzm != "png" && hzm != "jpg" && hzm != "JPG" && hzm != "PNG") {
            //     alert("亲，请选择一张PNG或者是JPG格式的图片哦")
            // }
            else {
                var file = btn_file[0].files[0];
                var data = new FormData();
                data.append('file', file)
                $.ajax({
                    url: all_net.upload_net,
                    type: "POST",
                    processData: false,
                    contentType: false,
                    data: data,
                    success: function (msg) {
                        $.ajax({
                            url: all_net.modifyHeadLogo_net,
                            type: "POST",
                            data: {
                                sign_str: sign_str,
                                user_id: id,
                                head_logo_path: msg.data.path,
                            },
                            success: function (msg) {
                                $.ajax({
                                    url: all_net.getHeadImg_net,
                                    type: 'GET',
                                    data: {
                                        username: username
                                    },
                                    success: function (msg) {
                                        var user_head_logo = msg.data[0].head_logo
                                        //获取的数据显示到页面
                                        avatar.attr("src", all_net.headInner_net + user_head_logo)
                                        avatar2.attr("src", all_net.headInner_net + user_head_logo)
                                        head_img.attr("src", all_net.headInner_net + user_head_logo)
                                        backg.children().eq(1).children().eq(0).children().empty().append(username)
                                        backg.children().eq(1).children().eq(1).children().empty().append(nikename)
                                        backg.children().eq(1).children().eq(2).children().empty().append(id)
                                    },
                                    error: function (msg) {
                                    }
                                })
                            },
                            error: function (msg) {
                            }
                        })
                    },
                    error: function (msg) {
                    }
                })
            }
        })
    },
    error: function () {
    }
})