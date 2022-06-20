local QBCore = exports['qb-core']:GetCoreObject()

QBCore.Functions.CreateUseableItem('laptop', function(source, item)
    
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if Player.Functions.GetItemByName(item.name) ~= nil then
        print('server laptop triggered')

        
        TriggerClientEvent('f-memory:toggleGUI', src, true)
    end
end)

