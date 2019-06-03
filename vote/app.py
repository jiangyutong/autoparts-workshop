# -*- coding: utf-8 -*

from flask import Flask, render_template, request, make_response, g
from redis import Redis
import os
import socket
import random
import json
import uuid
import sys

# 设置默认编码（python2的写法，python3中已经不需要了）
reload(sys)
sys.setdefaultencoding('utf-8')

# 获取环境变量
option_a = os.getenv('OPTION_A', "空气滤芯")
option_b = os.getenv('OPTION_B', "汽车电瓶")
option_c = os.getenv('OPTION_C', "刹车片")
option_d = os.getenv('OPTION_D', "汽油滤芯")
option_e = os.getenv('OPTION_E', "电瓶搭火线")
option_f = os.getenv('OPTION_F', "刹车钳")

# 获取本机计算机名
hostname = socket.gethostname()

# 创建Flask实例，使用关键字参数static_folder改变 默认的静态文件夹
app = Flask(__name__,static_folder='assets')

def get_redis():
    # hasattr(object，name)函数用于判断对象是否包含对应的属性（字符串）
    # g对象：global 专门用来保存用户数据，一次请求中的所有代码地方都可使用
    if not hasattr(g, 'redis'):
        # 连接redis
        g.redis = Redis(host="redis", db=0, socket_timeout=5)
    return g.redis

# 装饰器@app.route指定该路由，可接收的请求方式：["GET","POST"]
@app.route("/", methods=['POST','GET'])
def hello():
    # UUID是128位的全局唯一标识符，通常由32字节的字符串表示（uuid4基于随机数，有一定概率的重复）
    voter_id = str(uuid.uuid4())
    if not voter_id:
        voter_id = hex(random.getrandbits(64))[2:-1]

    vote = None

    if request.method == 'POST':
        redis = get_redis()
        # 获取以POST方式提交的数据（接收Form提交来的数据）
        vote = request.form['vote']
        # 将一个Python数据类型列表进行json格式的编码
        data = json.dumps({'voter_id': voter_id, 'vote': vote})
        redis.rpush('votes', data)

    # 可以把返回的值包在了make_response函数里面，然后再通过.set_cookie绑定cookie
    # render_template是模板渲染，功能是先引入index.html，同时根据后面传入的参数，对html进行修改渲染
    resp = make_response(render_template(
        'index.html',
        option_a=option_a,
        option_b=option_b,
        option_c=option_c,
        option_d=option_d,
        option_e=option_e,
        option_f=option_f,
        hostname=hostname,
        vote=vote,
    ))
    resp.set_cookie('voter_id', voter_id)
    return resp

if __name__ == "__main__":
    # 启动Flask Web程序，其中debug = True是指进入调试模式，服务器会在代码修改后，自动重新载入
    # 将服务端口绑定到0.0.0.0，可以通过多个ip地址访问服务，例如通过内网地址或外网地址都可以访问
    # threaded=True为每个新请求都会启动一个线程
    app.run(host='0.0.0.0', port=80, debug=True, threaded=True)
