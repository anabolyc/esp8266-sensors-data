local M = {};

M.start = function(_ssid, _pass, callback)
    wifi.sta.eventMonReg(wifi.STA_FAIL, function() print("STATION_CONNECT_FAIL") end)

    wifi.sta.eventMonReg(wifi.STA_GOTIP, function() 
        print("STATION_GOT_IP", wifi.sta.getip());
        if (callback) then
            callback();
        end
    end)
    
    --register callback: use previous state
    wifi.sta.eventMonReg(wifi.STA_CONNECTING, function(previous_State)
        if(previous_State==wifi.STA_GOTIP) then
            print("Station lost connection with access point\n\tAttempting to reconnect...")
        else
            print("STATION_CONNECTING")
        end
    end)
    --unregister callback
    -- wifi.sta.eventMonReg(wifi.STA_IDLE)
    wifi.sta.eventMonStart();
    
    wifi.setmode(wifi.STATION)
    local connect_result = wifi.sta.config(_ssid, _pass);
    print ("Wifi connect_result: ", connect_result);
end

return M;