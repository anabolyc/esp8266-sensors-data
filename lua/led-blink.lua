local M = {};

M.start = function(PIN_LED, TMR_ID)
    gpio.mode(PIN_LED, gpio.OUTPUT);
    
    tmr.alarm(TMR_ID, 5000, tmr.ALARM_AUTO, 
        function()
            gpio.write(PIN_LED, gpio.LOW)
            tmr.delay(200)
            gpio.write(PIN_LED, gpio.HIGH)
        end
    )
end

return M;
