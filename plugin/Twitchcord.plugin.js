//META{"name":"Twitchcord"}*//
/* global bdPluginStorage, $, PluginUtilities, PluginContextMenu */
/* Special thanks to Zerebos#7790 for helping us out with the right click context menus. ❤ */

class Twitchcord {
  constructor () {
    this.BASE_URL = 'https://rawgit.com/dperolio/twitchcordTheme/master';
    this.userBackgrounds = new Object();
    this.SNIPPET_URL = `${this.BASE_URL}/pluginSnippets/snippets.json`;
    this.USER_BG_URL = 'https://api.github.com/gists/aaa364d4cae7e5c0cf7799c6fd5310d3';
    this.PLUGIN_URL = `${this.BASE_URL}/plugin/Twitchcord.plugin.js`;

    this.observers = [];
    this.contextObserver = new MutationObserver((changes) => {
      for (const change of changes) {
        this.observeContextMenus(change);
      }
    });
    this.observers.push(this.contextObserver);

    this.initialized = false;

    this.selectedTabClasses = 'itemDefaultSelected-1UAWLe item-3879bf selected-eNoxEK';
    this.unselectedTabClasses = 'itemDefault-3NDwnY item-3879bf notSelected-PgwTMa';

    this.styleTag = this.createElement('style', { id: 'twitchcord-styletag' });
    document.body.appendChild(this.styleTag);

    const bodySelect = document.body;
    bodySelect.setAttribute('tc-plugin-enabled', '');
  }

  async injectUserBackgrounds () {
    const res = await window.fetch(this.USER_BG_URL).then(r => r.json());
    this.userBackgrounds = JSON.parse(res.files['userBackgrounds.json'].content);

    const MO = new MutationObserver(async changes => {
      if (changes.some(change =>
        change.addedNodes && change.addedNodes[0] &&
        change.addedNodes[0].className === 'backdrop-2ohBEd'
      )) {
        this.injectUserModal();
      } else if (changes.some(change => 
        change.target && change.target.className.includes('popouts')
      )) {
        this.injectUserPopout();
      }
    });

    MO.observe(document.querySelector('#app-mount'), { childList: true, subtree: true });
    this.observers.push(MO);
  }

  async injectUserPopout () {
    const header = document.querySelector('.userPopout-4pfA0d .avatar-1BXaQj');
    if (!header) {
      return;
    }
    

    const id = header.children[0].style.backgroundImage.split('/')[4];
    if (this.userBackgrounds[id]) {
      header.style.backgroundImage = `url("${this.userBackgrounds[id]}")`;
    }
  }

  async injectUserModal () {
    const header = document.querySelector('.root-2sNHUF .header-2Lg0Oe');
    if (
      !header ||
      !header.children[0] ||
      !header.children[0].children[0]
    ) {
      return;
    }
    const id = header.children[0].children[0].style.backgroundImage.split('/')[4];

    if (this.userBackgrounds[id]) {
      header.style.backgroundImage = `url("${this.userBackgrounds[id]}")`;
    }
  }

  get hamburgerMenu () {
    const e = window.BDV2.react.createElement;
    return class HamburgerMenu extends window.BDV2.react.Component {
      get socialUL () {
        const socialInfo = [
          ['Facebook', 'https://www.facebook.com/BakedPVP'],
          ['Twitter', 'https://twitter.com/BakedPVP_'],
          ['Discord', 'https://www.discord.me/twitchcord'],
          ['GitHub', 'https://github.com/dperolio/twitchcordTheme'],
          ['Twitch', 'https://twitch.tv/bakedpvp'],
          ['Patreon', 'https://www.patreon.com/twitchcord'],
          ['Website', 'https://twitchcord.com']
        ];

        const socialLIs = socialInfo.map(item => {
          return e('li', { className: 'tc-hamburger-social-li' },
            e('a', {
              className: `tc-hamburger-social-a ${item[0].toLowerCase()}`,
              href: item[1],
              target: '_blank',
            },
              e('span', { className: 'tc-hamburger-social-a-span tooltip tooltip-black' }, item[0])
            )
          );
        });

        return e('ul', { className: 'tc-hamburger-social-ul' },
          ...socialLIs
        );
      }

      render () {
        return e('div', { id: 'twitchcord-hamburger-menu-container', style: { display: 'none' } },
          e('div', { className: 'tc-logo-bg' }),

          e('div', { className: 'tc-hamburger-top' },
            e('div', { className: 'tc-hamburger-heading options' }),
            e('div', { className: 'tc-hamburger-options-inner' })
          ),

          e('div', { className: 'tc-hamburger-middle' },
            e('div', { className: 'tc-hamburger-heading support' }),
            e('div', { className: 'tc-hamburger-support-inner' },
              e('p', { className: 'tc-hamburger-p' }, 'Running into a problem while using Twitchcord or have a suggestion to make? Click the button below to head on over to our official Discord server.',
                e('a', { href: 'https://www.discord.me/twitchcord', target: '_blank', className: 'tc-hamburger-a' }, 'https://www.discord.me/twitchcord')
              )
            )
          ),

          e('div', { className: 'tc-hamburger-bottom' },
            e('div', { className: 'tc-hamburger-heading social' }),
            e('div', { className: 'tc-hamburger-social-inner' },
              this.socialUL
            )
          )

        );
      }
    };
  }

  async renderToggles () {
    const _this = this;
    const e = window.BDV2.react.createElement;
    class settingsToggle extends window.BDV2.react.Component {
      constructor (props) {
        super(props);

        this.checked = _this.getState(this.props.title) === !this.props.inverted;
      }

      click () {
        this.checked = !this.checked;
        _this.toggleSnippet(this.props.title);
        this.setState(() => ({
          checked: this.checked
        }));
      }

      render () {
        const style = { flex: '1 1 auto' };
        const style2 = { flex: '0 0 auto' };

        return e('div', {
          className: 'flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO margin-top-8 margin-bottom-40',
          style
        },
          e('div', {
            className: 'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO',
            style
          },
            e('h3', {
              className: 'titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q',
              style
            }, this.props.title),
            e('div', {
              className: `flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU
                        ${this.checked ? 'valueChecked-3Bzkbm' : 'valueUnchecked-XR6AOk'}`,
              style: style2,
              onClick: this.click.bind(this)
            },
              e('input', {
                type: 'checkbox',
                className: 'checkboxEnabled-4QfryV checkbox-1KYsPm',
                value: this.checked ? 'on' : 'off'
              })
            )
          ),
          e('div', { className: 'divider-1G01Z9 dividerDefault-77PXsz marginTop20-3UscxH' })
        );
      }
    }

    class settingsToggles extends window.BDV2.react.Component {
      render () {
        const settingToggles = _this.buttons.map(button => {
          return e(settingsToggle, {
            title: button.title,
            inverted: button.inverted
          });
        });

        return e('div', {},
          ...settingToggles);
      }
    }

    window.BDV2.reactDom.render(e(settingsToggles), document.querySelector('.tc-hamburger-options-inner'));
  }

  async addHamburgerMenu () {
    if (!window.BDV2) {
      return setTimeout(this.addHamburgerMenu.bind(this), 2000);
    }
    const qSA = document.querySelectorAll('#twitchcord-hamburger-menu-vessel, #twitchcord-hamburger-clicker, #twitchcord-hamburger-menu-container, #tc-hamburger-backdrop');
    if (qSA) { // todo: remove this
      Array.from(qSA).map(e => e.remove());
    }

    const titleBar = document.querySelector('div[class*=titleBar]');
    if (!titleBar) {
      return;
    }

    const menuVessel = this.createElement('div', { id: 'twitchcord-hamburger-menu-vessel' });
    titleBar.insertBefore(menuVessel, titleBar.children[0]);

    const hamburger = this.createElement('div', {
      id: 'twitchcord-hamburger-clicker',
      style: 'z-index: 100 !important'
    });

    const hamburgerBackdrop = this.createElement('div', { id: 'tc-hamburger-backdrop' });

    titleBar.insertBefore(hamburgerBackdrop, titleBar.children[0]);
    titleBar.insertBefore(hamburger, titleBar.children[0]);

    await window.BDV2.reactDom.render(window.BDV2.react.createElement(this.hamburgerMenu), menuVessel);
    titleBar.replaceChild(document.querySelector('#twitchcord-hamburger-menu-container'), menuVessel);

    const container = document.querySelector('#twitchcord-hamburger-menu-container');
    const openContainer = () => {
      container.setAttribute('opened', '');
      document.body.setAttribute('tc-opened', '');
      this.renderToggles();
    };

    const closeContainer = () => {
      container.removeAttribute('opened');
      document.body.removeAttribute('tc-opened');
      setTimeout(() => {
        document.querySelector('.tc-hamburger-options-inner').innerHTML = '';
      }, 500);
    };

    hamburger.onclick = () => {
      if (container.hasAttribute('opened')) {
        closeContainer();
      } else {
        openContainer();
      }
    };

    const app = document.querySelector('.layer').parentNode.parentNode.parentNode;
    app.onclick = () => {
      if (container.hasAttribute('opened')) {
        closeContainer();
      }
    };

    this.keyDownEvent = (event) => {
      if (event.key === 'Escape') {
        if (container.hasAttribute('opened')) {
          closeContainer();
        }
      }
      if (event.altKey) {
        if (event.key === 'ArrowLeft') {
          closeContainer();
        }
        if (event.key === 'ArrowRight') {
          openContainer();
        }
      }
    };
    document.body.addEventListener('keydown', this.keyDownEvent.bind(this));
  }

  loadSnippets () {
    this.buttons
      .filter(snippet => bdPluginStorage.get('Twitchcord', snippet.title) && bdPluginStorage.get('Twitchcord', snippet.title).state)
      .forEach(snippet => {
        this.styleTag.innerHTML += `${snippet.filePath}\n`;
        bdPluginStorage.set('Twitchcord', snippet.title, { state: true });
      });

    this.buttons
      .filter(snippet => snippet.default)
      .filter(snippet => bdPluginStorage.get('Twitchcord', snippet.title) === null)
      .forEach(snippet => {
        this.toggleSnippet(snippet.title);
      });
  }

  getSettingsPanel () {
    return '<img src onerror="document.querySelector(\'#twitchcord-button\').click();">'; // LUL
  }

  watchState () {
    const onMutation = async (mutations) => {
      for (const mut of mutations) {
        if (mut.target.className.includes('stop-animations')) {
          this.injectTab();
          break;
        }
      }
    };

    const tabObserver = new MutationObserver(onMutation);
    this.observers.push(tabObserver);
    tabObserver.observe(document.querySelector('.app .layer'), { attributes: true });
  }

  createElement (type, properties) {
    const element = document.createElement(type);
    for (const prop in properties) {
      element[prop] = properties[prop];
    }
    return element;
  }

  injectTab () {
    if (document.querySelector('#twitchcord-tab')) {
      return;
    }

    const TwitchcordTab = this.createElement('div', { id: 'twitchcord-tab' }); // Create the wrapper for the whole section
    const divider = this.createElement('div', { className: 'separator-3z7STW marginTop8-2gOa2N marginBottom8-1mABJ4' }); // Create the divider at the top
    const header = this.createElement('div', {
      className: 'header-1-f9X5',
      innerHTML: 'Twitchcord'
    }); // Create the header for the section
    const button = this.createElement('div', {
      id: 'twitchcord-button',
      className: this.unselectedTabClasses,
      innerText: 'Theme Settings'
    }); // Create the button that will open the menu

    for (const item of [divider, header, button]) {  // Append all of our components into the section
      TwitchcordTab.appendChild(item);
    }

    const settingsBar = document.querySelector('.layer .sidebar .side-2nYO0F');
    settingsBar.insertBefore(TwitchcordTab, document.querySelector('span#bd-settings-sidebar')); // Inject our section into the settings sidebar

    Array.from(settingsBar.children)
      .filter(el => el.className.includes('item') || el.id) // Filter out headers, dividers whatnot
      .forEach(c => {
        if (c.children[2] && c.children[2].innerHTML === 'Theme Settings') { // If it's our button
          c.children[2].onclick = () => {
            this.renderSettings();
            button.className = this.selectedTabClasses;
            const querySelector = document.querySelector('.layer .sidebar .side-2nYO0F .itemDefaultSelected-1UAWLe.item-3879bf.selected-eNoxEK:not(#twitchcord-button)');
            if (querySelector) {
              querySelector.className = this.unselectedTabClasses;
            } else {
              const selectedTab = document.querySelector('.layer .sidebar .side-2nYO0F div.ui-tab-bar-item.selected:not(#twitchcord-button)');
              if (selectedTab) {
                selectedTab.className = 'ui-tab-bar-item';
              }
            }
          };
        } else if (c.id === 'bd-settings-sidebar') { // If it's a BD button
          Array.from(c.children[0].children[0].children)
            .filter(c => c.className.includes('item'))
            .forEach(BDChild => {
              BDChild.onclick = () => {
                button.className = this.unselectedTabClasses;
              };
            });
        } else {
          c.onclick = () => { // If it's a normal Discord button
            c.className = c.innerHTML === 'Discord Nitro' ? 'itemBrandSelected-3LxxzT item-3879bf selected-eNoxEK' : this.selectedTabClasses;
            button.className = this.unselectedTabClasses;
          };
        }
      });
  }

  getState (key) {
    const stuff = bdPluginStorage.get('Twitchcord', key);
    return stuff ? stuff.state : false;
  }

  toggleSnippet (title) {
    const snippet = bdPluginStorage.get('Twitchcord', title);
    const css = this.buttons.find(b => b.title === title).filePath;
    if (snippet && snippet.state) {
      this.styleTag.innerHTML = this.styleTag.innerHTML.replace(css, '');
    } else {
      this.styleTag.innerHTML = `${css}\n${this.styleTag.innerHTML}`;
    }
    bdPluginStorage.set('Twitchcord', title, { state: snippet ? !snippet.state : true });
  }

  get buttons () {
    return $
      .ajax({
        url: this.SNIPPET_URL,
        async: false
      })
      .responseJSON
      .map(r => ({
        default: r.default,
        title: r.title,
        inverted: r.inverted,
        description: r.description,
        filePath: `@import url("${this.BASE_URL}${r.filePath}");\n`
      }));
  }

  reset () {
    for (const button of this.buttons) {
      bdPluginStorage.set('Twitchcord', button.title, { state: button.default ? true : false });
    }
    this.styleTag.innerHTML = '';
    this.loadSnippets();
    this.injectUserBackgrounds();
  }

  get settingTabThing () {
    const e = window.BDV2.react.createElement;
    const _this = this;
    return class extends window.BDV2.react.Component {
      get toggleClass () {
        const e = window.BDV2.react.createElement;
        return class extends window.BDV2.react.Component {
          constructor (props) {
            super(props);
            this.checked = _this.getState(this.props.title) === !this.props.inverted;
          }

          click () {
            this.checked = !this.checked;
            _this.toggleSnippet(this.props.title);
            this.setState(() => ({
              checked: this.checked
            }));
          }

          render () {
            return e('div', {
              className: 'flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO margin-top-20 margin-bottom-20',
              style: { flex: '1 1 auto', margin: 0, marginTop: '10px' }
            },
              e('div', {
                className: 'flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO',
                style: { flex: '1 1 auto' }
              },
                e('h3', {
                  className: 'h3-gDcP8B title-1pmpPr size16-3IvaX_ height24-2pMcnc weightMedium-13x9Y8 defaultColor-v22dK1 title-3i-5G_ marginReset-3hwONl flexChild-1KGW5q',
                  style: { flex: '1 1 auto' }
                }, this.props.title),
                e('div', {
                  className: `flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU
                            ${this.checked ? 'valueChecked-3Bzkbm' : 'valueUnchecked-XR6AOk'}`,
                  onClick: this.click.bind(this),
                  style: { flex: '0 0 auto' }
                },
                  e('input', {
                    type: 'checkbox',
                    className: 'checkbox-1KYsPm checkboxEnabled-4QfryV',
                    value: this.checked ? 'on' : 'off'
                  }),
                  e('div', {
                    className: `switch-3lyafC ${this.checked ? 'checked-7qfgSb' : ''}`
                  })
                )
              ),
              e('div', {
                className: 'description-3MVziF formText-1L-zZB modeDefault-389VjU primary-2giqSn',
              }, this.props.description),
              e('div', { className: 'divider-1G01Z9 marginTop4-2rEBfJ marginBottom20-2Ifj-2' })
            );
          }
        };
      }
      render () {
        const buttons = _this.buttons.map(button => {
          return e(this.toggleClass, {
            title: button.title,
            inverted: button.inverted,
            description: button.description
          });
        });


        return e('div', { id: 'twitchcord-settings' },
          e('h2', {
            className: 'h2-2ar_1B title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh2-37e5HZ marginBottom20-2Ifj-2',
            style: { flex: 'none', display: 'inline-block', marginRight: '20px', marginBottom: '15px' }
          }, 'Twitchcord Theme Settings'),
          e('button', {
            className: 'flexChild-1KGW5q buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra',
            onClick: () => { _this.reset.bind(_this)(); this.forceUpdate(); },
            style: { flex: 'none', display: 'inline-block' }
          },
            e('div', {
              className: 'contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM',
            }, 'Reset to Defaults')
          ),
          ...buttons
        );
      }
    };
  }

  renderSettings () {
    const querySelector = document.querySelector('#bd-settings-sidebar span div .selected') ?
      '#bd-settingspane-container div div div' :
      '.layer .content-column div';

    window.BDV2.reactDom.render(window.BDV2.react.createElement(this.settingTabThing), document.querySelector(querySelector));
  }

  async update (code) {
    const { writeFileSync } = require('fs');
    const { join } = require('path');
    let pluginPath;

    switch (process.platform) {
      case 'win32':
        pluginPath = join(process.env.appdata, 'BetterDiscord', 'plugins');
        break;
      case 'darwin':
        pluginPath = join(process.env.HOME, 'Library', 'Preferences', 'BetterDiscord', 'Plugins');
        break;
      default:
        pluginPath = join(process.env.HOME, '.config', 'BetterDiscord', 'plugins');
    }

    pluginPath = join(pluginPath, 'Twitchcord.plugin.js');
    writeFileSync(pluginPath, code);
  }

  async checkForUpdate () {
    const GHPlugin = await window.fetch(this.PLUGIN_URL).then(r => r.text());
    const versionRegex = /getVersion \(\) {\n {4}return '([^]*?)';/;
    const GHVersions = versionRegex.exec(GHPlugin)[1].split('.').map(Number);
    const localVersions = this.getVersion().split('.').map(Number);
    for (const version of GHVersions) {
      if (version > localVersions[GHVersions.indexOf(version)]) {
        this.update(GHPlugin);
        break;
      }
    }
  }

  start () {
    this.oldRatio = window.devicePixelRatio;
    window.devicePixelRatio = 2;

    this.loadSnippets();
    this.watchState();
    this.addHamburgerMenu();
    this.injectUserBackgrounds();
    this.checkForUpdate();

    /* Most of everything beyond this point is Zere's script */

    let libraryScript = document.getElementById('zeresLibraryScript');
    if (libraryScript) {
      libraryScript.parentElement.removeChild(libraryScript);
    }
    libraryScript = this.createElement('script', {
      type: 'text/javascript',
      src: 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js',
      id: 'zeresLibraryScript'
    });
    document.head.appendChild(libraryScript);

    if (typeof window.ZeresLibrary !== 'undefined') {
      this.initialize();
    } else {
      libraryScript.addEventListener('load', () => { this.initialize(); });
    }
  }

  initialize () {
    this.initialized = true;
    $('.container-iksrDt div.button-1aU9q1').on('contextmenu.bdcs', () => { this.bindContextMenus(); });
    PluginUtilities.showToast(`${this.getName()} ${this.getVersion()} has started.`);
  }

  observer (e) {
    if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element) || !e.addedNodes[0].classList) { return; }
    if (!e.addedNodes[0].querySelector('.container-iksrDt div.button-1aU9q1')) { return; }
    $('.container-iksrDt div.button-1aU9q1').on('contextmenu.bdcs', () => { this.bindContextMenus(); });
  }

  stop () {
    document.body.setAttribute('tc-plugin-enabled', '');

    window.devicePixelRatio = this.oldRatio;

    for (const observer of this.observers) {
      observer.disconnect();
    }
    $('*').off('.bdcs');
    document.body.removeEventListener('keydown', this.keyDownEvent.bind(this));
    for (const element of Array.from(document.querySelectorAll('#twitchcord-hamburger-menu-vessel, #twitchcord-hamburger-clicker, #twitchcord-hamburger-menu-container, #tc-hamburger-backdrop, #twitchcord-styletag'))) {
      element.remove();
    }
  }

  bindContextMenus () {
    this.contextObserver.observe(document.querySelector('.app'), { childList: true });
  }

  unbindContextMenus () {
    this.contextObserver.disconnect();
  }

  observeContextMenus (e) {
    if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element) || !e.addedNodes[0].classList) { return; }
    const elem = e.addedNodes[0];
    const isContext = elem.classList.contains('context-menu');
    if (!isContext) { return; }
    const contextMenu = $(elem);

    const menus = {
      Core: new PluginContextMenu.Menu(true),
      Emotes: new PluginContextMenu.Menu(true),
      Plugins: new PluginContextMenu.Menu(true),
      Themes: new PluginContextMenu.Menu(true)
    };

    for (const setting in window.settings) {
      for (const item of [['core', 'Core'], ['emote', 'Emotes']]) {
        if (window.settings[setting].implemented && !window.settings[setting].hidden && window.settings[setting].cat === item[0]) {
          menus[item[1]].addItems(new PluginContextMenu.ToggleItem(setting, window.settingsCookie[window.settings[setting].id], {
            callback: () => {
              this.changeBDSetting(window.settings[setting].id);
            }
          }));
        }
      }
    }

    for (const item of [['plugins', 'Plugins'], ['themes', 'Themes']]) {
      for (const setting in window[`bd${item[0]}`]) {
        menus[item[1]].addItems(new PluginContextMenu.ToggleItem(setting, window[`${item[0].slice(0, -1)}Cookie`], {
          callback: () => {
            this[`toggle${item[1].slice(0, -1)}`](setting);
          }
        }));
      }
    }

    const TCSubMenu = new PluginContextMenu.Menu(true);

    for (const button of this.buttons) {
      const checked = this.getState(button.title) === !button.inverted;
      TCSubMenu.addItems(new PluginContextMenu.ToggleItem(button.title, checked, {
        callback: () => {
          this.toggleSnippet(button.title);
        }
      }));
    }
    const TCmenu = new PluginContextMenu.SubMenuItem('Twitchcord', new PluginContextMenu.Menu(false).addItems(
      new PluginContextMenu.SubMenuItem('Theme Settings', TCSubMenu, { callback: () => { contextMenu.hide(); this.openTCMenu(0); } })
    ));
    contextMenu.append(new PluginContextMenu.ItemGroup().addItems(TCmenu).getElement());
    contextMenu.css('top', `-=${TCmenu.getElement().outerHeight()}`);

    const settings = ['Core', 'Emotes', 'Custom CSS', 'Plugins', 'Themes']
      .map(item => {
        const callback = () => {
          contextMenu.hide();
          this.openMenu(settings.indexOf(item));
        };

        const args = [item, menus[item] || { callback }, menus[item] ? { callback } : null];
        return new PluginContextMenu[item === 'Custom CSS' ? 'TextItem' : 'SubMenuItem'](...args);
      });

    const menu = new PluginContextMenu.SubMenuItem('BetterDiscord', new PluginContextMenu.Menu(false).addItems(...settings));
    contextMenu.append(new PluginContextMenu.ItemGroup().addItems(menu).getElement());
    contextMenu.css('top', `-=${menu.getElement().outerHeight()}`);

    this.unbindContextMenus();
  }

  changeBDSetting (setting) {
    window.settingsCookie[setting] = !window.settingsCookie[setting];
    window.settingsPanel.updateSettings();
  }

  enablePlugin (plugin) {
    const enabled = window.pluginCookie[plugin];
    if (!enabled) {
      this.togglePlugin(plugin);
    }
  }

  disablePlugin (plugin) {
    const enabled = window.pluginCookie[plugin];
    if (enabled) {
      this.togglePlugin(plugin);
    }
  }

  togglePlugin (plugin) {
    const enabled = window.pluginCookie[plugin];
    if (enabled) {
      try {
        window.bdplugins[plugin].plugin.stop();
      } catch (e) {
        PluginUtilities.showToast(`There was an issue stopping ${plugin}`, { type: 'error' });
      }
    } else {
      try {
        window.bdplugins[plugin].plugin.start();
      } catch (e) {
        PluginUtilities.showToast(`There was an issue starting ${plugin}`, { type: 'error' });
      }
    }
    window.pluginCookie[plugin] = !window.pluginCookie[plugin];
    window.pluginModule.savePluginData();
  }

  enableTheme (theme) {
    const enabled = window.themeCookie[theme];
    if (!enabled) {
      this.toggleTheme(theme);
    }
  }

  disableTheme (theme) {
    const enabled = window.themeCookie[theme];
    if (enabled) {
      this.toggleTheme(theme);
    }
  }

  toggleTheme (theme) {
    const enabled = window.themeCookie[theme];
    if (enabled) {
      const elem = document.getElementById(theme);
      if (elem) {
        elem.remove();
      }
    } else {
      $('<style>', { id: theme, html: unescape(window.bdthemes[theme].css) }).appendTo(document.head);
      PluginUtilities.showToast(`${theme} was successfully applied!`, { type: 'success' });
    }
    window.themeCookie[theme] = !window.themeCookie[theme];
    window.themeModule.saveThemeData();
  }

  openMenu (index) {
    const observer = new MutationObserver((changes) => {
      for (const e of changes) {
        if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element) || !e.addedNodes[0].classList) { return; }
        if (e.addedNodes[0].querySelector('#bd-settings-sidebar') || e.addedNodes[0].id === 'bd-settings-sidebar') {
          document.querySelectorAll('#bd-settings-sidebar .ui-tab-bar-item')[index].click();
          document.querySelectorAll('#bd-settings-sidebar .ui-tab-bar-item')[index].classList.add('selected');
          observer.disconnect();
        }
      }
    });
    observer.observe(document.querySelector('.app'), { childList: true, subtree: true });
    $('.container-iksrDt div.button-1aU9q1').click();
  }

  openTCMenu (index) {
    const observer = new MutationObserver((changes) => {
      for (const e of changes) {
        if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element) || !e.addedNodes[0].classList) { return; }
        if (e.addedNodes[0].querySelector('#twitchcord-tab') || e.addedNodes[0].id === 'twitchcord-tab') {
          document.querySelectorAll('#twitchcord-tab .item-3879bf')[index].click();
          observer.disconnect();
        }
      }
    });
    observer.observe(document.querySelector('.app'), { childList: true, subtree: true });
    $('.container-iksrDt div.button-1aU9q1').click();
  }

  load () { }

  unload () { }

  getDescription () {
    return 'The official plugin for Twitchcord. Includes fixes and features and a full array of user theme settings options!';
  }

  getName () {
    return 'Twitchcord';
  }

  getVersion () {
    return '0.5.1';
  }

  getAuthor () {
    return 'Aetheryx#2222 & BakedPVP#9516';
  }
}

module.exports = Twitchcord;
