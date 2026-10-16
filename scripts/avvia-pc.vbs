' Avvia NutriTrack PRO su questo PC (http://127.0.0.1:5180), senza finestre.
' Usato dall'attivita' pianificata "NutriTrack PRO locale" all'accesso a Windows.
' Serve la cartella dist: dopo ogni modifica al codice rifare "npm run build".
Set sh = CreateObject("WScript.Shell")
cartella = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & "\.."
sh.CurrentDirectory = cartella
sh.Run "cmd /c npx vite preview > ""%TEMP%\nutritrack-locale.log"" 2>&1", 0, False
