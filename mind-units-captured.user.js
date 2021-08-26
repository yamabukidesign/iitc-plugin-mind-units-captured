// ==UserScript==
// @id             iitc-plugin-mind-units-captured@yamabukidesign
// @name           IITC plugin: Mind Units Captured
// @author         yamabukidesign
// @category       Layer
// @version        0.1.1
// @namespace      https://github.com/yamabukidesign/iitc-plugin-mind-units-captured
// @updateURL      https://github.com/yamabukidesign/iitc-plugin-mind-units-captured/blob/main/mind-units-captured.user.js
// @downloadURL    https://github.com/yamabukidesign/iitc-plugin-mind-units-captured/blob/main/mind-units-captured.user.js
// @description    IITC : How much MUs does an agent captured.
// @include		   https://intel.ingress.com/*
// @match		   https://intel.ingress.com/*
// @grant          none
// ==/UserScript==
//

const wrapper = (plugin_info) => {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if (typeof window.plugin !== 'function') window.plugin = () => {};

    //PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
    //(leaving them in place might break the 'About IITC' page or break update checks)
    plugin_info.buildName = 'mind-units-captured';
    plugin_info.dateTimeVersion = '20200624.123456';
    plugin_info.pluginId = 'mind-units-captured';
    //END PLUGIN AUTHORS NOTE

    // PLUGIN START ////////////////////////////////////////////////////////
    // use own namespace for plugin
    window.plugin.muc = () => {};

    window.plugin.muc.setup = () => {
        console.log(`i'm alive`);

        //prepare control
        const muc_d = document.createElement("div");
        muc_d.className = "leaflet-control-muc leaflet-bar leaflet-control";
        const muc_a = document.createElement("a");
        muc_a.className = "leaflet-bar-part";
        muc_a.title = "click for culc MUs";
        muc_a.innerHTML = "<strong>M</strong>";

        //dialog HTML 1
        const inpt_d = document.createElement("div");
        const inpt_i = document.createElement("input");
        inpt_i.placeholder = "__jarvis__";
        inpt_d.appendChild(inpt_i);
        let idno = 0;

        //dialog HTML 2
        const ext_d = document.createElement("div");
        const ext_e = document.createElement("h3");
        const ext_u = document.createElement("ul");
        const ext_r = document.createElement("h3");
        const ext_p = document.createElement("p");
        ext_d.appendChild(ext_e);
        ext_e.append(`EXTRACTION:`);
        ext_d.appendChild(ext_u);
        ext_d.appendChild(ext_r);
        ext_r.append(`TOTAL:`);
        ext_d.appendChild(ext_p);

        //dialog 1
        const optionDialog = {
            title : "enter agent",
            id :    `mmt${idno}`,
            html :  inpt_d,
            closeCallback : () => {
                inpt_i.value && rtConfirm(inpt_i.value);
                idno++;
            }
        }

        //dialog 2
        const resultDialog = {
            title : "results",
            id :    `res${idno}`,
            html :  ext_d,
            closeCallback : () => {
                ext_u.innerHTML = '';
                ext_p.textContent = '';
                inpt_i.value = '';
            }
        }

        //calculation
        const rtConfirm = _agent_name => {
            const chatall_log = document.querySelector("#chatall").innerText;
            console.log(chatall_log);
            console.log(_agent_name);
            console.log(idno);

            //*
            const MatchName = new RegExp(`${_agent_name}.*?created.*?MUs`);
            const MatchGain = new RegExp(`[\+]([0-9]+) MUs`);
            const logArray = chatall_log.split("\n");
            let MU = 0, CF = 0;
            for (let log_line of logArray){
                if (log_line.search(MatchName) > 0){
                    //log_line = log_line.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    const MUpart = log_line.match(MatchGain);
                    MU += Number(MUpart[1]);
                    const muc_li = document.createElement("li");
                    muc_li.append(`${log_line} : →${MU}`);
                    ext_u.appendChild(muc_li);
                    CF++;
                }
            }
            if(MU ===0 || CF ===0){
                const muc_li = document.createElement("li");
                muc_li.append(`no CF!`);
                ext_u.appendChild(muc_li);
            }
            console.log(`${MU} MUs / ${CF} CF`);
            ext_p.append(`${MU} MUs / ${CF} CF`);
            window.dialog(resultDialog);
        }

        //
        muc_a.addEventListener("click", () => {
            window.dialog(optionDialog);
        });
        muc_d.appendChild(muc_a);
        const ltll =document.querySelector(".leaflet-control-container").firstChild;
        ltll.appendChild(muc_d);
    }

       const setup = window.plugin.muc.setup;
    // PLUGIN END //////////////////////////////////////////////////////////

    setup.info = plugin_info; //add the script info data to the function as a property
    if (!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if (window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end

// inject code into site context
const script = document.createElement('script');
const info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script){
    info.script = {
        version: GM_info.script.version,
        name: GM_info.script.name,
        description: GM_info.script.description
    }
};

script.appendChild(document.createTextNode(`(${wrapper})(${JSON.stringify(info)});`));
(document.body || document.head || document.documentElement).appendChild(script);
