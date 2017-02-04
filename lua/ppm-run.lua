local M = {};

local ppm=-1
local h  = 0
local l  = 0
local tl = 0  
local th = 0
local c  = 0 
local PIN_CDI_LOCAL = 0;
local DEBUG = false;
local ppm_callback;

local function pin1cb(level, time)
    if DEBUG then print("pin1cb", "level = ", level, " c = ", c); end
    local tt = time / 1000;
    
    if level == gpio.HIGH then
        h = tt;
        tl = h - l;
        ppm = 5000 * (th - 2) / (th + tl - 4)
    end 

    if level == gpio.LOW then
        l = tt;
        th = l - h;
        ppm = 5000 * (th - 2) / (th + tl - 4)
    end     

    if c > 3 then 
        gpio.mode(PIN_CDI_LOCAL, gpio.INPUT);
        if DEBUG then print('pp LAST', ppm) end
        ppm_callback(ppm);
        return;
    end
    
    c = c + 1
    gpio.trig(PIN_CDI_LOCAL, level == gpio.HIGH and "down" or "up");
end

M.start = function (PIN_CDI, callback)
    c  = 0;
    PIN_CDI_LOCAL = PIN_CDI;
    ppm_callback = callback;

    gpio.mode(PIN_CDI, gpio.INT);
    gpio.trig(PIN_CDI, "up", pin1cb);
end
    
return M;