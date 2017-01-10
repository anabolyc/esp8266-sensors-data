local M
do

ppm      =-1
local h  = 0
local l  = 0
local tl = 0  
local th = 0
local c  = 0 
local DEBUG = false

local function getco2()
    gpio.mode(1, gpio.INT)
    gpio.trig(1, "up", function (level)
        local tt = tmr.now() / 1000;
        if level == 1 then 
            h = tt;
            tl = h - l;
            ppm = 5000 * (th - 2) / (th + tl - 4)
            if DEBUG then print('pp HIGH', ppm) end
        else
            l = tt;
            th = l - h;
            ppm = 5000 * (th - 2) / (th + tl - 4)
            if DEBUG then print('pp LOW ', ppm) end
        end
             
        if c > 3 then 
            gpio.mode(1, gpio.INPUT)  
            if DEBUG then print('pp LAST', ppm) end
            return ppm 
        end
        
        c = c + 1
        
        if level == 1 then gpio.trig(1, "down") else gpio.trig(1, "up") end
    end)
    
    local i = 0
    repeat
        tmr.delay(1000) 
        i = i + 1;
    until (ppm > 100) or (i > 3000)

    if ppm > 0 then 
        return ppm; 
    else 
        return nil; 
    end
end

M = getco2
end
return M
