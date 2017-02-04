local _ssid = "wifi-12-private";
local _pass = "9263777101";

local LED_TMR_ID = 1;
local CDI_TMR_ID = 2;

local PIN_DHT = 7;
local PIN_LED = 4;
local PIN_CDI = 1;

local DEBUG = false;
local ext = (DEBUG == true and ".lua" or ".lc");
local LC_LED_BLINK = 'led-blink' .. ext;
local LC_PPM_RUN   = 'ppm-run' .. ext;
local LC_FIFI_CONN = 'wifi-connect' .. ext;
local LC_WEB_SRV   = 'web-srv' .. ext;

local led_blink = dofile(LC_LED_BLINK);
led_blink.start(PIN_LED, LED_TMR_ID);

local ppm = 0;
local ppm_run = dofile(LC_PPM_RUN);
tmr.alarm(CDI_TMR_ID, 5000, tmr.ALARM_AUTO, function()
    ppm_run.start(PIN_CDI, function(ppm_value)
        if DEBUG then print("ppm  = ", ppm); end
        ppm = ppm_value;
    end);
end)

local wifi = dofile(LC_FIFI_CONN);
local web_srv = dofile(LC_WEB_SRV);
wifi.start(_ssid, _pass, function()
    web_srv.start(8080, PIN_DHT, function() 
        return ppm;
    end);
end);