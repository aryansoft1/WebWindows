<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
Option Explicit
Response.ContentType = "application/json"
Response.Charset = "UTF-8"

Dim fso, rootPath, username, userFolder, folder, file
Dim userSize, sysSize, diskTotal, folderCount
Dim cpuModel, cpuUsage, memUsed, memTotal
Set fso = Server.CreateObject("Scripting.FileSystemObject")

' cloud/file 路径
rootPath = Server.MapPath("/cloud/file/")

' 用户名
username = Request.Cookies("username")
If username = "" Then username = "admin"

' 统计用户文件夹大小
userFolder = rootPath & "\" & username
userSize = 0
If fso.FolderExists(userFolder) Then
    userSize = getFolderSize(fso.GetFolder(userFolder))
End If

' 统计 cloud/file 以外的系统占用
sysSize = getSystemSize(fso)

' 用户目录数量
folderCount = 0
For Each folder In fso.GetFolder(rootPath).SubFolders
    folderCount = folderCount + 1
Next
If folderCount = 0 Then folderCount = 1 ' 防止除以 0

' 虚拟主机总容量（1229MB）
diskTotal = 1229


' WMI 获取 CPU 和内存信息
Dim objWMIService, objItem, colItems, json
Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")

If Err.Number = 0 Then
    ' 获取 CPU 使用率
    Set colItems = objWMIService.ExecQuery("Select * from Win32_Processor")
    For Each objItem in colItems
        cpuUsage = objItem.LoadPercentage
        cpuModel = objItem.Name
        Exit For
    Next

    ' 获取内存信息
    Set colItems = objWMIService.ExecQuery("Select * from Win32_OperatingSystem")
    For Each objItem in colItems
        memTotal = CLng(objItem.TotalVisibleMemorySize) ' 单位KB
        memUsed = memTotal - CLng(objItem.FreePhysicalMemory)
        Exit For
    Next
Else
    ' CPU / 内存虚拟主机不可用
    cpuModel = "N/A"
    cpuUsage = Null
    memUsed = 0
    memTotal = 0
End If

' 输出 JSON

Response.Write "{"
Response.Write """cpuModel"":""" & cpuModel & ""","
If IsNull(cpuUsage) Then
    Response.Write """cpuUsage"":null,"
Else
    Response.Write """cpuUsage"":" & cpuUsage & ","
End If

Response.Write """memUsed"":" & formatJsonNumber(Round(memUsed / 1024, 2)) & ","
Response.Write """memTotal"":" & formatJsonNumber(Round(memTotal / 1024, 2)) & ","
Response.Write """diskUsed"":" & formatJsonNumber(Round(userSize / 1048576, 2)) & ","
Response.Write """sysUsed"":" & formatJsonNumber(Round(sysSize / 1048576, 2)) & ","
Response.Write """diskTotal"":" & formatJsonNumber(Round(diskTotal, 2))

Response.Write "}"
%>

<%
Function getSystemSize(fso)
    Dim siteRoot, cloudPath, filePath
    Dim totalSize, cloudSize, userSize, sysSize
    siteRoot = Server.MapPath("/")              ' 网站根目录
    cloudPath = Server.MapPath("/cloud")        ' cloud 路径
    filePath = Server.MapPath("/cloud/file")    ' cloud/file 路径

    ' 获取总占用
    totalSize = getFolderSize(fso.GetFolder(siteRoot))

    ' 获取 cloud/file 占用（含所有用户数据）
    cloudSize = 0
    If fso.FolderExists(filePath) Then
        cloudSize = getFolderSize(fso.GetFolder(filePath))
    End If

    ' 获取系统占用（总占用减去 cloud/file 占用）
    sysSize = totalSize - cloudSize

    ' 获取当前用户名
    Dim username
    username = Request.Cookies("username")
    If username = "" Then username = "admin"

    ' 获取该用户文件夹大小
    userSize = 0
    If fso.FolderExists(filePath & "\" & username) Then
        userSize = getFolderSize(fso.GetFolder(filePath & "\" & username))
    End If
    getSystemSize = sysSize
End Function
Function getFolderSize(folder)
    Dim size, f
    size = 0
    For Each f In folder.Files
        size = size + f.Size
    Next
    For Each f In folder.SubFolders
        size = size + getFolderSize(f)
    Next
    getFolderSize = size
End Function
' 正确处理带前导0的小数
Function FormatJsonNumber(n)
    If IsNull(n) Then
        FormatJsonNumber = "null"
    Else
        Dim s
        s = CStr(n)
        If Left(s, 1) = "." Then
            FormatJsonNumber = "0" & s
        ElseIf Left(s, 2) = "-." Then
            FormatJsonNumber = "-0" & Mid(s, 2)
        Else
            FormatJsonNumber = s
        End If
    End If
End Function



%>
