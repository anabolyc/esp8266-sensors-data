pin = 4
gpio.mode(pin, gpio.OUTPUT)
tmr.alarm(1, 5000, tmr.ALARM_AUTO, 
    function()
        gpio.write(pin, gpio.LOW)
        tmr.delay(200)
        gpio.write(pin, gpio.HIGH)
    end
)
