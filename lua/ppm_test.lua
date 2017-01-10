
local ppm = dofile('ppmrun.lua')( );
print("ppm <- ", ppm);

ppm = nil

local buf = ""
if ppm == nil then
    buf = buf..'\t"cdio": "null",\r\n';
else
    buf = buf..'\t"cdio": "'..ppm..'",\r\n';
end
print("buf <- ", buf);