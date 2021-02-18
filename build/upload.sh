# /bin/bash
compressFile="resume.tar.gz"        # 压缩后的文件名
user="root"                         # 远程登录用户
origin="sugarat.top"                   # 远程登录origin
echo "开始-----上传"
scp $compressFile $user@$origin:./