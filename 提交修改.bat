@echo off
echo 开始执行git操作...
cd /d F:\projects\photo-analyzer
echo 当前目录：%CD%

REM 检查当前状态
echo 检查当前git状态...
git status

REM 添加所有更改到暂存区
echo 添加所有修改到暂存区...
git add .

REM 提交更改
echo 提交修改...
set /p commit_msg="请输入提交信息: "
git commit -m "%commit_msg%"

REM 拉取远程更改
echo 拉取远程更改...
git pull origin

REM 推送到远程分支
echo 推送到远程分支...
git push origin

echo 操作完成！
pause 