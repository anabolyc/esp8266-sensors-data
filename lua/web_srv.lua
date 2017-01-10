pinDHT = 7

wifi.setmode(wifi.STATION)
wifi.sta.config("wifi-12-private", "9263777101")

print(
    wifi.sta.getip()
)

srv=net.createServer(net.TCP)
srv:listen(8080, function(conn)
    conn:on("receive", function(client, request)
        --print(request)
        local _, __, method, path = string.find(request, "([A-Z]+) (.-) HTTP");
        local buf
        
        if path == "/data" then
            if (method == "GET") or (method == "HEAD") then
                buf = "HTTP/1.1 200 OK\r\n";
                buf = buf.."Content-type: application/json\r\n";
                buf = buf.."Connection: close\r\n\r\n";

                if method == "GET" then
                    buf = buf.."{\r\n";
                    local status, temp, humi, temp_decimal, humi_decimal = dht.read(pinDHT)
                    local ppm = dofile('ppmrun.lua')( );

                    if (status == dht.OK) then
                        buf = buf..'\t"temp": "'..temp..'",\r\n';
                        buf = buf..'\t"humidity": "'..humi..'",\r\n';
                        if ppm == nil then
                            buf = buf..'\t"cdio": "null",\r\n';
                        else
                            buf = buf..'\t"cdio": "'..ppm..'",\r\n';
                        end
                        buf = buf..'\t"error": null';
                    elseif (status == dht.ERROR_CHECKSUM) then
                        buf = buf..'\t"error": "DHT Checksum error"';
                    elseif (status == dht.ERROR_TIMEOUT) then
                        buf = buf..'\t"error": "DHT Time out"';
                    end
                    buf = buf.."\r\n}\r\n";
                end
            else
                buf = "HTTP/1.1 405 Method Not Allowed\r\n";
                buf = buf.."Allow:HEAD,GET\r\n";
                buf = buf.."Connection: close\r\n\r\n";
            end
        else
            buf = "HTTP/1.1 404 Not Found\r\n";
            buf = buf.."Connection: close\r\n\r\n";
        end

        client:send(buf);
        client:close();
        collectgarbage();
    end)
end)
