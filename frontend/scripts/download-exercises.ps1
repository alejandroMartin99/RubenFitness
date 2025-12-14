# Script para descargar GIFs de ejercicios
$outputDir = "frontend\src\assets\exercises"

$exercises = @{
    # ESPALDA - BICEPS
    "pull-up" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif"
    "lat-pulldown" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif"
    "close-grip-lat-pulldown" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Close-Grip-Lat-Pulldown.gif"
    "barbell-bent-over-row" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif"
    "dumbbell-row" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif"
    "seated-cable-row" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif"
    "barbell-deadlift" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif"
    "hyperextension" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/hyperextension.gif"
    "face-pull" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Face-Pull.gif"
    "dumbbell-pullover" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Pullover.gif"
    "barbell-curl" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif"
    "dumbbell-curl" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif"
    "hammer-curl" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif"
    "concentration-curl" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Concentration-Curl.gif"
    "barbell-preacher-curl" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Preacher-Curl.gif"
    "cable-curl" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Curl.gif"
    "incline-dumbbell-curl" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Curl.gif"
    "spider-curl" = "https://fitnessprogramer.com/wp-content/uploads/2021/06/Spider-Curl.gif"
    "barbell-shrug" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shrug.gif"
    
    # PECHO - TRICEPS
    "barbell-bench-press" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif"
    "incline-barbell-bench-press" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Barbell-Bench-Press.gif"
    "decline-barbell-bench-press" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Decline-Barbell-Bench-Press.gif"
    "dumbbell-press" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Press.gif"
    "incline-dumbbell-press" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif"
    "dumbbell-fly" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif"
    "cable-crossover" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crossover.gif"
    "chest-dips" = "https://fitnessprogramer.com/wp-content/uploads/2021/06/Chest-Dips.gif"
    "push-up" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif"
    "lying-triceps-extension" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Triceps-Extension.gif"
    "pushdown" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif"
    "bench-dip" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bench-Dip.gif"
    "dumbbell-kickback" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Kickback.gif"
    "close-grip-bench-press" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Close-Grip-Bench-Press.gif"
    "diamond-push-up" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Diamond-Push-up.gif"
    
    # PIERNA
    "barbell-squat" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif"
    "barbell-front-squat" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Front-Squat.gif"
    "leg-press" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif"
    "barbell-romanian-deadlift" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif"
    "dumbbell-lunge" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif"
    "bulgarian-split-squat" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bulgarian-Split-Squat.gif"
    "leg-extension" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif"
    "lying-leg-curl" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Leg-Curl.gif"
    "standing-calf-raise" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Standing-Calf-Raise.gif"
    "seated-calf-raise" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Calf-Raise.gif"
    "barbell-hip-thrust" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif"
    "dumbbell-step-up" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Step-up.gif"
    "hack-squat" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Hack-Squat.gif"
    "hip-adduction-machine" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Hip-Adduction-Machine.gif"
    "hip-abduction-machine" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/HIP-ABDUCTION-MACHINE.gif"
    "good-morning" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Good-Morning.gif"
    "farmers-walk" = "https://fitnessprogramer.com/wp-content/uploads/2022/04/Farmers-Walk.gif"
    
    # HOMBRO - BRAZO
    "barbell-shoulder-press" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shoulder-Press.gif"
    "dumbbell-shoulder-press" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif"
    "arnold-press" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Arnold-Press.gif"
    "dumbbell-lateral-raise" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif"
    "dumbbell-front-raise" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Front-Raise.gif"
    "rear-delt-fly" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Rear-Delt-Fly.gif"
    "barbell-upright-row" = "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Upright-Row.gif"
}

Write-Host "Descargando $($exercises.Count) GIFs de ejercicios..." -ForegroundColor Cyan

foreach ($name in $exercises.Keys) {
    $url = $exercises[$name]
    $outputPath = "$outputDir\$name.gif"
    
    if (Test-Path $outputPath) {
        Write-Host "Ya existe: $name.gif" -ForegroundColor Yellow
        continue
    }
    
    try {
        Write-Host "Descargando: $name.gif..." -ForegroundColor Green
        Invoke-WebRequest -Uri $url -OutFile $outputPath -UseBasicParsing
        Start-Sleep -Milliseconds 500
    } catch {
        Write-Host "Error descargando $name : $_" -ForegroundColor Red
    }
}

Write-Host "Descarga completada!" -ForegroundColor Cyan

