RegisterNetEvent('f-memory:toggleGUI', function(toggle)
    if toggle == true then
        SetNuiFocus(true, true)

        SendNUIMessage({
            open = 'open'
        })

        return
    end

    if toggle == false then
        SetNuiFocus(false, false)
        return
    end

end)
