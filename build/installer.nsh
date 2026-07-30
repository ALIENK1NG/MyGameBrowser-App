; Alienizor NSIS extras — install options + uninstall data choice
; Must stay in sync with shared/app-variant.cjs USER_DATA_DIR / CACHE_DIR_NAME
; Note: this file is included before MUI2 — do not use MUI_* macros here.

!include "nsDialogs.nsh"
!include "LogicLib.nsh"

!define ALIENIZOR_USER_DATA "com-alienizor-app"
!define ALIENIZOR_CACHE_DIR "alienizor-electron-cache"
!define ALIENIZOR_RUN_VALUE "Alienizor"
!define ALIENIZOR_SHORTCUT_NAME "Alienizor"

!ifndef BUILD_UNINSTALLER

Var AlienOptionsDialog
Var AlienDesktopCheckbox
Var AlienStartMenuCheckbox
Var AlienStartupCheckbox
Var AlienDesktopState
Var AlienStartMenuState
Var AlienStartupState

!macro customPageAfterChangeDir
  Page custom alienOptionsPageCreate alienOptionsPageLeave
!macroend

Function alienOptionsPageCreate
  nsDialogs::Create 1018
  Pop $AlienOptionsDialog
  ${If} $AlienOptionsDialog == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 28u "Install options: choose shortcuts and whether Alienizor starts with Windows. You can turn startup off later in Windows Settings - Apps - Startup."
  Pop $0

  ${NSD_CreateCheckbox} 0 36u 100% 12u "Create a desktop shortcut"
  Pop $AlienDesktopCheckbox
  ${NSD_Check} $AlienDesktopCheckbox

  ${NSD_CreateCheckbox} 0 54u 100% 12u "Create a Start Menu shortcut"
  Pop $AlienStartMenuCheckbox
  ${NSD_Check} $AlienStartMenuCheckbox

  ${NSD_CreateCheckbox} 0 72u 100% 12u "Start Alienizor when Windows starts"
  Pop $AlienStartupCheckbox

  nsDialogs::Show
FunctionEnd

Function alienOptionsPageLeave
  ${NSD_GetState} $AlienDesktopCheckbox $AlienDesktopState
  ${NSD_GetState} $AlienStartMenuCheckbox $AlienStartMenuState
  ${NSD_GetState} $AlienStartupCheckbox $AlienStartupState
FunctionEnd

!macro customInstall
  ${If} $AlienDesktopState == ${BST_UNCHECKED}
    Delete "$DESKTOP\${ALIENIZOR_SHORTCUT_NAME}.lnk"
    Delete "$DESKTOP\${PRODUCT_FILENAME}.lnk"
  ${EndIf}

  ${If} $AlienStartMenuState == ${BST_UNCHECKED}
    Delete "$SMPROGRAMS\${ALIENIZOR_SHORTCUT_NAME}.lnk"
    Delete "$SMPROGRAMS\${PRODUCT_FILENAME}.lnk"
    !ifdef MENU_FILENAME
      Delete "$SMPROGRAMS\${MENU_FILENAME}\${ALIENIZOR_SHORTCUT_NAME}.lnk"
      Delete "$SMPROGRAMS\${MENU_FILENAME}\${PRODUCT_FILENAME}.lnk"
    !endif
  ${EndIf}

  ${If} $AlienStartupState == ${BST_CHECKED}
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${ALIENIZOR_RUN_VALUE}" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}"'
  ${Else}
    DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${ALIENIZOR_RUN_VALUE}"
  ${EndIf}
!macroend

!endif

!macro customUnInstall
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${ALIENIZOR_RUN_VALUE}"

  ${if} ${isUpdated}
    Goto alienUninstallDone
  ${endIf}

  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Remove Alienizor library, themes, and settings from this PC?$\r$\n$\r$\nChoose No to keep your games list and themes for a future install.$\r$\nYour game files on disk are never deleted." \
    /SD IDNO IDYES alienWipeData IDNO alienUninstallDone

  alienWipeData:
    SetShellVarContext current
    RMDir /r "$APPDATA\${ALIENIZOR_USER_DATA}"
    RMDir /r "$LOCALAPPDATA\${ALIENIZOR_USER_DATA}"
    RMDir /r "$TEMP\${ALIENIZOR_CACHE_DIR}"

  alienUninstallDone:
!macroend

!macro customUnWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Uninstall Alienizor"
  !define MUI_WELCOMEPAGE_TEXT "This removes the Alienizor application from your PC.$\r$\n$\r$\nYou will be asked whether to also delete your library, themes, and settings. Game files installed by Steam/Epic/GOG stay on disk."
  !insertmacro MUI_UNPAGE_WELCOME
!macroend
