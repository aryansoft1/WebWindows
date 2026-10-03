<%
' Trusted host-only Validator deployment configuration.
' Values are inherited process environment variables and cannot be supplied by HTTP input.
Const WEBWINDOWS_VALIDATOR_EXE_ENV = "WEBWINDOWS_VALIDATOR_EXECUTABLE_PATH"
Const WEBWINDOWS_VALIDATOR_QUARANTINE_ENV = "WEBWINDOWS_VALIDATOR_QUARANTINE_PATH"

Function ValidatorDeploymentEnvironment(ByVal variableName)
  Dim shell, processEnvironment, value
  value = ""
  On Error Resume Next
  Set shell = Server.CreateObject("WScript.Shell")
  Set processEnvironment = shell.Environment("PROCESS")
  value = Trim(CStr(processEnvironment(CStr(variableName))))
  Set processEnvironment = Nothing
  Set shell = Nothing
  Err.Clear
  On Error GoTo 0
  ValidatorDeploymentEnvironment = value
End Function

Function ValidatorDeploymentDriveAbsolute(ByVal value)
  Dim regex
  Set regex = New RegExp
  regex.Pattern = "^[A-Za-z]:\\"
  ValidatorDeploymentDriveAbsolute = regex.Test(CStr(value))
  Set regex = Nothing
End Function

Function ValidatorDeploymentCanonical(ByVal fso, ByVal value)
  Dim normalized
  normalized = ""
  On Error Resume Next
  normalized = LCase(CStr(fso.GetAbsolutePathName(CStr(value))))
  If Err.Number <> 0 Then normalized = ""
  Err.Clear
  On Error GoTo 0
  Do While Len(normalized) > 3 And Right(normalized, 1) = "\"
    normalized = Left(normalized, Len(normalized) - 1)
  Loop
  ValidatorDeploymentCanonical = normalized
End Function

Function ValidatorDeploymentWithin(ByVal childPath, ByVal parentPath)
  Dim childValue, parentValue
  childValue = LCase(CStr(childPath))
  parentValue = LCase(CStr(parentPath))
  ValidatorDeploymentWithin = (childValue = parentValue Or _
    Left(childValue, Len(parentValue) + 1) = parentValue & "\")
End Function

Function ValidatorDeploymentLoad(ByRef executablePath, ByRef quarantinePath, ByRef failureCode)
  Dim fso, webRoot, canonicalExecutable, canonicalQuarantine, canonicalWebRoot
  ValidatorDeploymentLoad = False
  failureCode = "VALIDATOR_CONFIG_UNAVAILABLE"
  executablePath = ValidatorDeploymentEnvironment(WEBWINDOWS_VALIDATOR_EXE_ENV)
  quarantinePath = ValidatorDeploymentEnvironment(WEBWINDOWS_VALIDATOR_QUARANTINE_ENV)
  If Not ValidatorDeploymentDriveAbsolute(executablePath) Or _
     Not ValidatorDeploymentDriveAbsolute(quarantinePath) Then Exit Function

  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  canonicalExecutable = ValidatorDeploymentCanonical(fso, executablePath)
  canonicalQuarantine = ValidatorDeploymentCanonical(fso, quarantinePath)
  canonicalWebRoot = ValidatorDeploymentCanonical(fso, Server.MapPath(".."))
  If canonicalExecutable = "" Or canonicalQuarantine = "" Or canonicalWebRoot = "" Then
    Set fso = Nothing
    Exit Function
  End If
  If ValidatorDeploymentWithin(canonicalExecutable, canonicalWebRoot) Or _
     ValidatorDeploymentWithin(canonicalQuarantine, canonicalWebRoot) Or _
     ValidatorDeploymentWithin(canonicalExecutable, canonicalQuarantine) Then
    failureCode = "VALIDATOR_CONFIG_UNSAFE_PATH"
    Set fso = Nothing
    Exit Function
  End If
  If Not fso.FileExists(canonicalExecutable) Then
    failureCode = "SERVER_VALIDATOR_UNAVAILABLE"
    Set fso = Nothing
    Exit Function
  End If
  If Not fso.FolderExists(canonicalQuarantine) Then
    failureCode = "VALIDATOR_QUARANTINE_UNAVAILABLE"
    Set fso = Nothing
    Exit Function
  End If
  executablePath = canonicalExecutable
  quarantinePath = canonicalQuarantine
  failureCode = ""
  Set fso = Nothing
  ValidatorDeploymentLoad = True
End Function
%>
