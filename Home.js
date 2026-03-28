// Home.js — dynamically renders the maps and mods sections from data/maps.json and data/mods.json

(function () {
    'use strict';

    /** Escapes a value for safe insertion as HTML text content. */
    function esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /** Escapes a value for safe use inside an HTML attribute delimited by double-quotes. */
    function escAttr(str) {
        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    }

    // -------------------------------------------------------------------------
    // Maps
    // -------------------------------------------------------------------------

    function createMapCard(map) {
        return `<div class="card-container">
            <div class="card-base">
                <div class="card-front">
                    <div class="card-top">
                        <h1 class="card-text">${esc(map.name)}</h1>
                    </div>
                    <div class="card-middle">
                        <img class="card-image" src="images/satmaps/${escAttr(map.satmap)}" alt="SatMap">
                        <p class="card-middle-text" style="margin: -3px">Map Size: ${esc(map.size)} km</p>
                        <p class="card-middle-text">Zone Amount: ${map.zones}</p>
                    </div>
                    <div class="card-bottom"></div>
                </div>
                <div class="card-back">
                    <div class="card-top-back">
                        <h1 class="card-text">${esc(map.name)}</h1>
                    </div>
                    <div class="card-middle-back">
                        <p class="card-tooltip no-flip" data-value="${escAttr(map.scenario)}" onclick="copyToClipboard(this)">
                            Click To Copy<br>Scenario Name
                            <span class="card-tooltip-text">Click to copy</span>
                        </p>
                    </div>
                    <div class="card-middle-down-back">
                        <p class="card-middle-text-back">Resources: ${map.resources}</p>
                        <p class="card-middle-text-back">Factories: ${map.factories}</p>
                        <p class="card-middle-text-back">Outposts: ${map.outposts}</p>
                        <p class="card-middle-text-back">Seaports: ${map.seaports}</p>
                        <p class="card-middle-text-back">Military Bases: ${map.militaryBases}</p>
                        <p class="card-middle-text-back">Airports: ${map.airports}</p>
                    </div>
                    <div class="card-bottom-back">
                        <a href="${escAttr(map.download)}" target="_blank" rel="noopener noreferrer" class="card-button no-flip">${esc(map.downloadLabel)}</a>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function renderMaps(maps) {
        const grid = document.getElementById('card-grid');
        if (!grid) return;
        grid.innerHTML = maps.map(createMapCard).join('');
        // Re-run text resizing now that cards are in the DOM
        if (typeof resizeUITexts === 'function') resizeUITexts();
    }

    // -------------------------------------------------------------------------
    // Mod link helpers
    // -------------------------------------------------------------------------

    /**
     * Renders an array of link definitions into <li> elements.
     * Each item is either:
     *   { download, downloadLabel, suffix? }          — a single anchor, optional trailing text
     *   { parts: [ {download, downloadLabel}|{text} ] } — multiple anchors joined in one <li>
     */
    function renderModLinks(links) {
        if (!links || links.length === 0) return '';
        return links.map(link => {
            if (link.parts) {
                const inner = link.parts.map(part =>
                    part.download
                        ? `<a class="mods-link" href="${escAttr(part.download)}" target="_blank">${esc(part.downloadLabel)}</a>`
                        : esc(part.text || '')
                ).join('');
                return `<li>${inner}</li>`;
            }
            const suffix = link.suffix ? ` ${esc(link.suffix)}` : '';
            return `<li><a class="mods-link" href="${escAttr(link.download)}" target="_blank">${esc(link.downloadLabel)}</a>${suffix}</li>`;
        }).join('');
    }

    // -------------------------------------------------------------------------
    // General Mods tab
    // -------------------------------------------------------------------------

    function renderGeneralMods(items) {
        return items.map(item => {
            if (item.type === 'notice') {
                const bullets = item.bullets.map(b => `<li>${esc(b)}</li><br>`).join('');
                return `<div class="mods-content">
                    <h2 class="content-mods-header">${esc(item.name)}</h2>
                    <ul class="content-mods-info mods">${bullets}</ul>
                </div>`;
            }
            // description may contain intentional <br> tags — rendered as-is (trusted data)
            return `<div class="mods-content">
                <h2 class="content-mods-header">${esc(item.name)}</h2>
                <p class="content-mods-info">${item.description}</p>
                <a href="${escAttr(item.download)}" target="_blank" class="content-mods-button">${esc(item.downloadLabel)}</a>
                <div class="content-mods-divider"></div>
            </div>`;
        }).join('');
    }

    // -------------------------------------------------------------------------
    // Faction-style Mods tabs (Modern, Scifi, Historic, Unique)
    // -------------------------------------------------------------------------

    function renderFactionMod(item) {
        const rows = [];
        if (item.era)      rows.push(`<li>Era: ${esc(item.era)}</li>`);
        if (item.factions) rows.push(`<li>Factions: ${esc(item.factions)}</li>`);
        if (item.balancing) rows.push(`<li>Balancing: ${esc(item.balancing)}</li>`);
        if (item.requires)  rows.push(`<li>Requires: ${esc(item.requires)}</li>`);
        if (item.links)     rows.push(renderModLinks(item.links));

        const preNote = item.preNote
            ? `<p style="font-size:0.8rem">${esc(item.preNote)}</p>`
            : '';

        return `<div class="mods-content">
            <h1 class="content-mods-header">${esc(item.name)}</h1>
            <ul class="mods-2">${preNote}${rows.join('')}</ul>
            <div class="content-mods-divider-full"></div>
        </div>`;
    }

    function renderFactionMods(items) {
        return items.map(renderFactionMod).join('');
    }

    // -------------------------------------------------------------------------
    // Trader Mods tab
    // -------------------------------------------------------------------------

    function renderTraderMod(item) {
        return `<div class="mods-content">
            <h1 class="content-mods-header">${esc(item.name)}</h1>
            <ul class="mods-2">
                <li>Balancing: ${esc(item.balancing)}</li>
                <li><a class="mods-link" href="${escAttr(item.href)}" target="_blank">Download</a></li>
            </ul>
            <div class="content-mods-divider-full"></div>
        </div>`;
    }

    function renderTraderMods(trader) {
        return `<div class="mods-content">
                <h2 class="content-mods-header">Supported Mods (Weapons)</h2>
                <div class="content-mods-divider-full"></div>
            </div>
            ${trader.weapons.map(renderTraderMod).join('')}
            <div class="mods-content">
                <h2 class="content-mods-header">Supported Mods (Vehicles)</h2>
                <p style="font-size:0.8rem; text-align:center;">Most modsets have supported vehicles.</p>
                <div class="content-mods-divider-full"></div>
            </div>
            ${trader.vehicles.map(renderTraderMod).join('')}`;
    }

    // -------------------------------------------------------------------------
    // Vehicle Mods tab
    // -------------------------------------------------------------------------

    function renderVehicleMods(items) {
        return items.map(item => `<div class="mods-content">
            <h2 style="padding-bottom:10px; font-size:1.5rem;" class="content-mods-header">${esc(item.name)}</h2>
            <a class="content-mods-button" href="${escAttr(item.href)}" target="_blank">${esc(item.label)}</a>
            <div class="content-mods-divider-full"></div>
        </div>`).join('');
    }

    // -------------------------------------------------------------------------
    // cDLC Mods tab
    // -------------------------------------------------------------------------

    function renderCdlcMods(items) {
        return items.map(item => `<div class="mods-content">
            <h1 class="content-mods-header">${esc(item.name)}</h1>
            <ul class="mods-2">
                <li>Era: ${esc(item.era)}</li>
                ${renderModLinks(item.links)}
            </ul>
            <div class="content-mods-divider-full"></div>
        </div>`).join('');
    }

    // -------------------------------------------------------------------------
    // Populate mod tabs
    // -------------------------------------------------------------------------

    function setTabContent(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    function renderMods(mods) {
        setTabContent('Gen-Mods',     renderGeneralMods(mods.general));
        setTabContent('Modern-Mods',  renderFactionMods(mods.modern));
        setTabContent('Scifi-Mods',   renderFactionMods(mods.scifi));
        setTabContent('Historic-Mods',renderFactionMods(mods.historic));
        setTabContent('Unique-Mods',  renderFactionMods(mods.unique));
        setTabContent('Trader-Mods',  renderTraderMods(mods.trader));
        setTabContent('Vehicle-Mods', renderVehicleMods(mods.vehicle));
        setTabContent('cDLC-Mods',    renderCdlcMods(mods.cdlc));
    }

    // -------------------------------------------------------------------------
    // Bootstrap
    // -------------------------------------------------------------------------

    async function init() {
        try {
            const [maps, mods] = await Promise.all([
                fetch('/data/maps.json').then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); }),
                fetch('/data/mods.json').then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
            ]);
            renderMaps(maps);
            renderMods(mods);
        } catch (err) {
            console.error('Failed to load page data:', err);
        }
    }

    document.addEventListener('DOMContentLoaded', init);
}());
