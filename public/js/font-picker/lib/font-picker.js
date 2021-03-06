(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.window = global.window || {})));
}(this, (function (exports) { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  /**
   * Transform the font's name to a valid selector (make the name lowercase and replace spaces with
   * dashes)
   */
  function getFontSelector(font) {
    return font.family.replace(/\s+/g, '-').toLowerCase();
  }
  /**
   * Generate the URL to the Google Fonts stylesheet of the specified font
   */


  function getDownloadURL(font, variants, onlyCharacters) {
    // Base URL
    var url = 'https://fonts.googleapis.com/css?family='; // Font name

    url += font.family.replace(/ /g, '+'); // Font variants

    url += ":".concat(variants[0]);

    for (var i = 1; i < variants.length; i += 1) {
      url += ",".concat(variants[i]);
    } // Only download characters in the font name if onlyCharacters is true


    if (onlyCharacters === true) {
      // Remove spaces and duplicate letters from the font name
      var downloadChars = font.family;
      downloadChars = downloadChars.replace(/\s+/g, '');
      downloadChars = downloadChars.split('').filter(function (x, n, s) {
        return s.indexOf(x) === n;
      }).join('');
      url += "&text=".concat(downloadChars);
    }

    return url;
  }
  /**
   * Add Google Fonts stylesheet for the specified font family and variants
   */


  function downloadFullFont(font, fontSelector, variants, onChange) {
    var url = getDownloadURL(font, variants, false); // Add the stylesheet to the document head

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.id = "font-full-".concat(fontSelector);

    if (onChange) {
      // If onChange function is specified: execute it once the stylesheet has loaded
      link.onload = function () {
        onChange(font);
      };
    }

    document.head.appendChild(link);
  }
  /**
   * Add limited Google Fonts stylesheet for the specified font family (only containing the characters
   * which are needed to write the font family name)
   */


  function downloadPreviewFont(font, fontSelector, variants) {
    var url = getDownloadURL(font, variants, true); // Add the stylesheet to the document head

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.id = "font-preview-".concat(fontSelector);
    document.head.appendChild(link);
  }
  /**
   * Check whether the full font needs to be downloaded and do so if necessary. Afterwards, execute
   * the onChange function
   */


  function checkFullFont(font, variants, onChange) {
    var fontSelector = getFontSelector(font);

    if (document.getElementById("font-preview-".concat(fontSelector))) {
      // If preview font is available: replace it with the full font
      document.getElementById("font-preview-".concat(fontSelector)).outerHTML = ''; // remove tag

      downloadFullFont(font, fontSelector, variants, onChange);
    } else if (!document.getElementById("font-full-".concat(fontSelector))) {
      // If font is not available: download it
      downloadFullFont(font, fontSelector, variants, onChange);
    } else if (onChange) {
      // If font is available: execute onChange function if it is specified
      onChange(font);
    }
  }
  /**
   * Check whether the preview font needs to be downloaded and do so if necessary
   */

  function checkPreviewFont(font, variants) {
    var fontSelector = getFontSelector(font); // If full font is not available: download preview font

    if (!document.getElementById("font-full-".concat(fontSelector))) {
      downloadPreviewFont(font, fontSelector, variants);
    }
  }

  /**
   * Fetch list of all fonts available on Google Fonts, sorted by popularity
   */
  function fetchList(apiKey) {
    return new Promise(function (resolve, reject) {
      var url = "https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=".concat(apiKey);
      var request = new XMLHttpRequest();
      request.overrideMimeType('application/json');
      request.open('GET', url, true);

      request.onreadystatechange = function () {
        // Request has completed
        if (request.readyState === 4) {
          // On error
          if (request.status !== 200) {
            return reject(new Error("Response has status code ".concat(request.status)));
          } // On success


          var response = JSON.parse(request.responseText);
          return resolve(response.items);
        }
      };

      request.send();
    });
  }
  /**
   * Filter font list according to the specified options
   */

  function filterList(fontList, defaultFont, options) {
    var filteredList = fontList; // 'families' parameter (only keep fonts whose names are included in the provided array)

    if (options.families) {
      filteredList = filteredList.filter(function (font) {
        return options.families.includes(font.family);
      });
    } // 'categories' parameter (only keep fonts in categories from the provided array)


    if (options.categories) {
      filteredList = filteredList.filter(function (font) {
        return options.categories.includes(font.category);
      });
    } // 'variants' parameter (only keep fonts with at least the specified variants)


    if (options.variants) {
      filteredList = filteredList.filter(function (font) {
        for (var i = 0; i < options.variants.length; i += 1) {
          if (font.variants.indexOf(options.variants[i]) === -1) {
            return false;
          }
        }

        return true;
      });
    } // 'limit' parameter (limit font list size)


    if (options.limit) {
      filteredList = filteredList.slice(0, options.limit);
    } // Add default font to list if it is not already in it


    if (filteredList.filter(function (font) {
      return font.family === defaultFont.family;
    }).length === 0) {
      // Add default font to beginning of list
      filteredList.unshift(defaultFont); // Remove least popular font from list if limit parameter is set

      if (options.limit) {
        filteredList.pop();
      }
    } // 'sort' parameter (list is already sorted by popularity)


    if (options.sort === 'alphabetical') {
      filteredList = filteredList.sort(function (fontA, fontB) {
        return fontA.family.localeCompare(fontB.family);
      });
    }

    return filteredList;
  }

  /**
   * Class responsible for adding/removing CSS styles for applying the active font and font previews
   */
  var StyleManager =
  /*#__PURE__*/
  function () {
    function StyleManager(pickerName, activeFont, variants) {
      _classCallCheck(this, StyleManager);

      if (pickerName !== '') {
        this.pickerSuffix = "-".concat(pickerName);
      } else {
        this.pickerSuffix = '';
      }

      this.stylesheetId = "font-selectors".concat(this.pickerSuffix);
      this.determineFontVariants(variants); // If stylesheet for applying font styles was created earlier, continue using it, otherwise
      // create new one

      var existingStylesheet = document.getElementById(this.stylesheetId);

      if (existingStylesheet) {
        this.stylesheet = existingStylesheet;
      } else {
        this.initStylesheet(activeFont);
      }
    }
    /**
     * Determine the specified font variants (style and weight) and save them in the corresponding
     * object variables
     */


    _createClass(StyleManager, [{
      key: "determineFontVariants",
      value: function determineFontVariants(variants) {
        // Font weight/style for previews: split number and text in font variant parameter
        var defaultVariant = variants[0].split(/(\d+)/).filter(Boolean); // Determine font variants which will be applied to the fonts in the font picker and to elements
        // of the .apply-font class

        if (defaultVariant.length === 1) {
          // Either font weight or style is specified (e.g. 'regular, '300', 'italic')
          if (defaultVariant[0] === 'regular' || defaultVariant[0] === 'italic') {
            // Font style is specified
            var _defaultVariant = _slicedToArray(defaultVariant, 1);

            this.fontStyle = _defaultVariant[0];
            this.fontWeight = '400';
          } else {
            // Font weight is specified
            this.fontStyle = 'regular';

            var _defaultVariant2 = _slicedToArray(defaultVariant, 1);

            this.fontWeight = _defaultVariant2[0];
          }
        } else if (defaultVariant.length === 2) {
          // Both font weight and style are specified
          var _defaultVariant3 = _slicedToArray(defaultVariant, 2);

          this.fontWeight = _defaultVariant3[0];
          this.fontStyle = _defaultVariant3[1];
        }
      }
      /**
       * Generate the selector for the default font, set up the font picker's stylesheet and add it to
       * the document head
       */

    }, {
      key: "initStylesheet",
      value: function initStylesheet(activeFont) {
        this.stylesheet = document.createElement('style');
        this.stylesheet.id = this.stylesheetId;
        this.stylesheet.rel = 'stylesheet';
        this.stylesheet.type = 'text/css'; // Apply the default active font

        var style = "\n\t\t\t.apply-font".concat(this.pickerSuffix, " {\n\t\t\t\tfont-family: \"").concat(activeFont.family, "\";\n\t\t\t\tfont-style: ").concat(this.fontStyle, ";\n\t\t\t\tfont-weight: ").concat(this.fontWeight, ";\n\t\t\t}\n\t\t");
        this.stylesheet.appendChild(document.createTextNode(style));
        document.head.appendChild(this.stylesheet);
      }
      /**
       * Add CSS selector for applying a preview font
       */

    }, {
      key: "applyPreviewStyle",
      value: function applyPreviewStyle(font) {
        var fontId = font.family.replace(/\s+/g, '-').toLowerCase();
        var style = "\n\t\t\t.font-".concat(fontId).concat(this.pickerSuffix, " {\n\t\t\t\tfont-family: \"").concat(font.family, "\";\n\t\t\t\tfont-style: ").concat(this.fontStyle, ";\n\t\t\t\tfont-weight: ").concat(this.fontWeight, ";\n\t\t\t}\n\t\t");
        this.stylesheet.appendChild(document.createTextNode(style));
      }
      /**
       * Update the CSS selector for applying the active font to the .apply-font class
       */

    }, {
      key: "changeActiveStyle",
      value: function changeActiveStyle(activeFont, previousFont) {
        // Apply font and set fallback fonts
        var fallbackFont = activeFont.category === 'handwriting' ? 'cursive' : activeFont.category;
        var style = "\n\t\t\t.apply-font".concat(this.pickerSuffix, " {\n\t\t\t\tfont-family: \"").concat(activeFont.family, "\", \"").concat(previousFont, "\", ").concat(fallbackFont, ";\n\t\t\t\tfont-style: ").concat(this.fontStyle, ";\n\t\t\t\tfont-weight: ").concat(this.fontWeight, ";\n\t\t\t}\n\t\t");
        this.stylesheet.replaceChild(document.createTextNode(style), this.stylesheet.childNodes[0]);
      }
    }]);

    return StyleManager;
  }();

  /**
   * Class for managing the list of fonts for the font picker, keeping track of the active font, and
   * downloading/activating Google Fonts
   * @param {string} apiKey (required) - Google API key
   * @param {string} defaultFont - Font that is selected on initialization (default: 'Open Sans')
   * @param {Object} options - Object with additional (optional) parameters:
   *   @param {string} name - If you have multiple font pickers on your site, you need to give them
   *   unique names (which may only consist of letters and digits). These names must also be appended
   *   to the font picker's ID and the .apply-font class name.
   *   Example: If { name: 'main' }, use #font-picker-main and .apply-font-main
   *   @param {string[]} families - If only specific fonts shall appear in the list, specify their
   *   names in an array
   *   @param {string[]} categories - Array of font categories
   *   Possible values: 'sans-serif', 'serif', 'display', 'handwriting', 'monospace' (default: all
   *   categories)
   *   @param {string[]} variants - Array of variants which the fonts must include and which will be
   *   downloaded; the first variant in the array will become the default variant (and will be used
   *   in the font picker and the .apply-font class)
   *   Example: ['regular', 'italic', '700', '700italic'] (default: ['regular'])
   *   @param {number} limit - Maximum number of fonts to be displayed in the list (the least popular
   *   fonts will be omitted; default: 100)
   *   @param {string} sort - Sorting attribute for the font list
   *   Possible values: 'alphabetical' (default), 'popularity'
   * @param {function} onChange - Function which is executed whenever the user changes the active font
   * and its stylesheet finishes downloading
   */

  var FontManager =
  /*#__PURE__*/
  function () {
    _createClass(FontManager, null, [{
      key: "validateParameters",

      /**
       * Validate parameters passed to the class constructor
       */
      value: function validateParameters(apiKey, defaultFont, options, onChange) {
        // Parameter validation
        if (!apiKey || typeof apiKey !== 'string') {
          throw Error('apiKey parameter is not a string or missing');
        }

        if (defaultFont && typeof defaultFont !== 'string') {
          throw Error('defaultFont parameter is not a string');
        }

        if (_typeof(options) !== 'object') {
          throw Error('options parameter is not an object');
        }

        if (options.name) {
          if (typeof options.name !== 'string') {
            throw Error('options.name parameter is not a string');
          }

          if (options.name.match(/[^0-9a-z]/i)) {
            throw Error('options.name may only contain letters and digits');
          }
        }

        if (options.families && !(options.families instanceof Array)) {
          throw Error('options.families parameter is not an array');
        }

        if (options.categories && !(options.categories instanceof Array)) {
          throw Error('options.categories parameter is not an array');
        }

        if (options.variants && !(options.variants instanceof Array)) {
          throw Error('options.variants parameter is not an array');
        }

        if (options.limit && typeof options.limit !== 'number') {
          throw Error('options.limit parameter is not a number');
        }

        if (options.sort && typeof options.sort !== 'string') {
          throw Error('options.sort parameter is not a string');
        }

        if (onChange && typeof onChange !== 'function') {
          throw Error('onChange is not a function');
        }
      }
      /**
       * Set default values for options that have not been specified
       */

    }, {
      key: "setDefaultOptions",
      value: function setDefaultOptions(options) {
        var newOptions = options;

        if (!options.name) {
          newOptions.name = '';
        }

        if (!options.limit) {
          newOptions.limit = 100;
        }

        if (!options.variants) {
          newOptions.variants = ['regular'];
        }

        if (!options.sort) {
          newOptions.sort = 'alphabetical';
        }

        return newOptions;
      }
      /**
       * Download the default font (if necessary) and apply it
       */

    }]);

    function FontManager(apiKey, defaultFont) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var onChange = arguments.length > 3 ? arguments[3] : undefined;

      _classCallCheck(this, FontManager);

      // Check parameters and apply defaults if necessary
      FontManager.validateParameters(apiKey, defaultFont, options, onChange);
      var newDefaultFont = defaultFont || 'Open Sans';
      var newOptions = FontManager.setDefaultOptions(options); // Save parameters as class variables

      this.apiKey = apiKey;
      this.onChange = onChange;
      this.options = newOptions; // Set activeFont and initialize font list

      this.activeFont = {
        family: newDefaultFont,
        variants: 'regular'
      };
      this.fonts = [];
      this.previewIndex = 0; // list index up to which font previews have been downloaded
      // Download and apply default font

      checkFullFont(this.activeFont, this.options.variants);
      this.styleManager = new StyleManager(this.options.name, this.activeFont, this.options.variants);
    }
    /**
     * Download list of available Google Fonts and filter/sort it according to the specified
     * parameters in the 'options' object
     */


    _createClass(FontManager, [{
      key: "init",
      value: function init() {
        var _this = this;

        return fetchList(this.apiKey).then(function (fontList) {
          _this.fonts = filterList(fontList, _this.activeFont, _this.options);

          _this.downloadPreviews(10);
        });
      }
      /**
       * Download font previews for the list entries up to the given index
       */

    }, {
      key: "downloadPreviews",
      value: function downloadPreviews(downloadIndex) {
        // Stop at the end of the font list
        var downloadIndexMax;

        if (downloadIndex > this.fonts.length) {
          downloadIndexMax = this.fonts.length;
        } else {
          downloadIndexMax = downloadIndex;
        } // Download the previews up to the given index and apply them to the list entries


        for (var i = this.previewIndex; i < downloadIndexMax; i += 1) {
          this.styleManager.applyPreviewStyle(this.fonts[i]);
          checkPreviewFont(this.fonts[i], this.options.variants);
        }

        if (downloadIndexMax > this.previewIndex) {
          this.previewIndex = downloadIndexMax;
        }
      }
      /**
       * Set the specified font as the active one, download it (if necessary) and apply it. On success,
       * return the index of the font in the font list. On error, return -1.
       */

    }, {
      key: "setActiveFont",
      value: function setActiveFont(fontFamily) {
        var listIndex = this.fonts.findIndex(function (f) {
          return f.family === fontFamily;
        });

        if (listIndex === -1) {
          // Font is not part of font list: Keep current activeFont and log error
          console.error("Cannot update activeFont: The font \"".concat(fontFamily, "\" is not in the font list"));
          return -1;
        } // Font is part of font list: Update activeFont and set previous one as fallback


        var previousFont = this.activeFont.family;
        this.activeFont = this.fonts[listIndex];
        this.styleManager.changeActiveStyle(this.activeFont, previousFont);
        checkFullFont(this.activeFont, this.options.variants, this.onChange);
        return listIndex;
      }
    }]);

    return FontManager;
  }();

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css = "@charset \"UTF-8\";\ndiv[id^=\"font-picker\"] {\n  position: relative;\n  display: inline-block;\n  width: 200px;\n  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2); }\n  div[id^=\"font-picker\"] * {\n    box-sizing: border-box; }\n  div[id^=\"font-picker\"] p {\n    margin: 0;\n    padding: 0; }\n  div[id^=\"font-picker\"] button {\n    background: none;\n    border: 0;\n    color: inherit;\n    cursor: pointer;\n    font-size: inherit;\n    outline: none; }\n  div[id^=\"font-picker\"] .dropdown-button {\n    height: 35px;\n    width: 100%;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 0 10px;\n    background: #CBCBCB; }\n    div[id^=\"font-picker\"] .dropdown-button:hover, div[id^=\"font-picker\"] .dropdown-button.expanded, div[id^=\"font-picker\"] .dropdown-button:focus {\n      background: #bebebe; }\n    div[id^=\"font-picker\"] .dropdown-button .dropdown-font-name {\n      overflow: hidden;\n      white-space: nowrap; }\n  div[id^=\"font-picker\"] .dropdown-icon {\n    margin-left: 10px; }\n\n@-webkit-keyframes spinner {\n  to {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg); } }\n\n@keyframes spinner {\n  to {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg); } }\n    div[id^=\"font-picker\"] .dropdown-icon.loading:before {\n      content: '';\n      display: block;\n      height: 10px;\n      width: 10px;\n      border-radius: 50%;\n      border: 2px solid #b2b2b2;\n      border-top-color: black;\n      -webkit-animation: spinner 0.6s linear infinite;\n              animation: spinner 0.6s linear infinite; }\n    div[id^=\"font-picker\"] .dropdown-icon.finished:before {\n      content: '';\n      display: block;\n      height: 0;\n      width: 0;\n      border-left: 5px solid transparent;\n      border-right: 5px solid transparent;\n      border-top: 6px solid black;\n      transition: -webkit-transform 0.3s;\n      transition: transform 0.3s;\n      transition: transform 0.3s, -webkit-transform 0.3s;\n      margin: 0 2px; }\n    div[id^=\"font-picker\"] .dropdown-icon.error:before {\n      content: '⚠'; }\n  div[id^=\"font-picker\"] .dropdown-button.expanded .dropdown-icon.finished:before {\n    -webkit-transform: rotate(-180deg);\n            transform: rotate(-180deg); }\n  div[id^=\"font-picker\"] ul {\n    position: absolute;\n    z-index: 1;\n    max-height: 0;\n    width: 100%;\n    overflow-x: hidden;\n    overflow-y: auto;\n    -webkit-overflow-scrolling: touch;\n    margin: 0;\n    padding: 0;\n    background: #EAEAEA;\n    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);\n    transition: 0.3s; }\n    div[id^=\"font-picker\"] ul.expanded {\n      max-height: 200px; }\n    div[id^=\"font-picker\"] ul li {\n      height: 35px;\n      list-style: none; }\n      div[id^=\"font-picker\"] ul li button {\n        height: 100%;\n        width: 100%;\n        display: flex;\n        align-items: center;\n        padding: 0 10px;\n        white-space: nowrap; }\n        div[id^=\"font-picker\"] ul li button:hover, div[id^=\"font-picker\"] ul li button:focus {\n          background: #dddddd; }\n        div[id^=\"font-picker\"] ul li button.active-font {\n          background: #d1d1d1; }\n";
  styleInject(css);

  /**
   * User interface for the font picker
   * @see FontManager parameters
   */

  var FontPicker =
  /*#__PURE__*/
  function () {
    function FontPicker(apiKey, defaultFont, options, onChange) {
      _classCallCheck(this, FontPicker);

      // Function bindings
      this.closeEventListener = this.closeEventListener.bind(this); // Determine font picker ID and selector suffix from its name

      if (options.name) {
        this.pickerSuffix = "-".concat(options.name);
      } else {
        this.pickerSuffix = '';
      }

      this.pickerId = "font-picker".concat(this.pickerSuffix); // Initialize FontManager and FontPicker UI

      this.fontManager = new FontManager(apiKey, defaultFont, options, onChange);
      this.generateUI();
    }
    /**
     * Download list of available fonts and generate the font picker UI
     */


    _createClass(FontPicker, [{
      key: "generateUI",
      value: function generateUI() {
        var _this = this;

        this.expanded = false;
        var fontPickerDiv = document.getElementById(this.pickerId);

        if (!fontPickerDiv) {
          throw Error("Missing div with id=\"".concat(this.pickerId, "\""));
        } // HTML for dropdown button (name of active font and dropdown arrow)


        this.dropdownButton = document.createElement('button');
        this.dropdownButton.classList.add('dropdown-button');

        this.dropdownButton.onclick = function () {
          return _this.toggleExpanded();
        };

        this.dropdownButton.onkeypress = function () {
          return _this.toggleExpanded();
        };

        this.dropdownButton.type = 'button';
        fontPickerDiv.appendChild(this.dropdownButton); // Name of selected font

        this.dropdownFont = document.createElement('p');
        this.dropdownFont.innerHTML = this.fontManager.activeFont.family;
        this.dropdownFont.classList.add('dropdown-font-name');
        this.dropdownButton.append(this.dropdownFont); // Dropdown icon (possible classes/states: 'loading', 'finished', 'error')

        var dropdownIcon = document.createElement('p');
        dropdownIcon.classList.add('dropdown-icon', 'loading');
        this.dropdownButton.append(dropdownIcon); // HTML for font list

        this.ul = document.createElement('ul'); // Fetch font list, display dropdown arrow if successful

        this.fontManager.init().then(function () {
          dropdownIcon.classList.remove('loading');
          dropdownIcon.classList.add('finished'); // HTML for font list entries

          _this.ul.onscroll = function () {
            return _this.onScroll();
          }; // download font previews on scroll


          var _loop = function _loop(i) {
            var fontFamily = _this.fontManager.fonts[i].family;
            var fontId = fontFamily.replace(/\s+/g, '-').toLowerCase(); // Write font name in the corresponding font, set onclick listener

            var li = document.createElement('li');
            var fontButton = document.createElement('button');
            fontButton.type = 'button';
            fontButton.innerHTML = fontFamily;
            fontButton.classList.add("font-".concat(fontId).concat(_this.pickerSuffix));

            fontButton.onclick = function () {
              _this.toggleExpanded(); // collapse font list


              _this.setActiveFont(_this.fontManager.fonts[i].family);
            };

            fontButton.onkeypress = function () {
              _this.toggleExpanded(); // collapse font list


              _this.setActiveFont(_this.fontManager.fonts[i].family);
            };

            li.appendChild(fontButton); // If active font: highlight it and save reference

            if (_this.fontManager.fonts[i].family === _this.fontManager.activeFont.family) {
              fontButton.classList.add('active-font');
              _this.activeFontA = fontButton;
            }

            _this.ul.appendChild(li);
          };

          for (var i = 0; i < _this.fontManager.fonts.length; i += 1) {
            _loop(i);
          }

          fontPickerDiv.appendChild(_this.ul);
        }).catch(function (err) {
          dropdownIcon.classList.remove('loading');
          dropdownIcon.classList.add('error');
          var errMessage = 'Error trying to fetch the list of available fonts';
          console.error(errMessage);
          console.error(err);
          fontPickerDiv.title = errMessage;
        });
      }
      /**
       * EventListener for closing the font picker when clicking anywhere outside it
       */

    }, {
      key: "closeEventListener",
      value: function closeEventListener(e) {
        var targetElement = e.target; // clicked element

        do {
          if (targetElement === document.getElementById(this.pickerId)) {
            // Click inside font picker
            return;
          } // Move up the DOM


          targetElement = targetElement.parentNode;
        } while (targetElement); // Click outside font picker


        this.toggleExpanded();
      }
      /**
       * Return the object of the currently selected font
       */

    }, {
      key: "getActiveFont",
      value: function getActiveFont() {
        return this.fontManager.activeFont;
      }
      /**
       * Download the font previews for all visible font entries and the five after them
       */

    }, {
      key: "onScroll",
      value: function onScroll() {
        var elementHeight = this.ul.scrollHeight / this.fontManager.fonts.length;
        var downloadIndex = Math.ceil((this.ul.scrollTop + this.ul.clientHeight) / elementHeight);
        this.fontManager.downloadPreviews(downloadIndex + 5);
      }
      /**
       * Set the font with the given font list index as the active one and highlight it in the list
       */

    }, {
      key: "setActiveFont",
      value: function setActiveFont(fontFamily) {
        var listIndex = this.fontManager.setActiveFont(fontFamily);

        if (listIndex >= 0) {
          // On success: Write new font name in dropdown button and highlight it in the font list
          this.dropdownFont.innerHTML = fontFamily;
          this.activeFontA.classList.remove('active-font');
          this.activeFontA = this.ul.getElementsByTagName('li')[listIndex].firstChild;
          this.activeFontA.classList.add('active-font');
        }
      }
      /**
       * Expand/collapse the picker's font list
       */

    }, {
      key: "toggleExpanded",
      value: function toggleExpanded() {
        if (this.expanded) {
          this.expanded = false;
          this.dropdownButton.classList.remove('expanded');
          this.ul.classList.remove('expanded');
          document.removeEventListener('click', this.closeEventListener);
        } else {
          this.expanded = true;
          this.dropdownButton.classList.add('expanded');
          this.ul.classList.add('expanded');
          document.addEventListener('click', this.closeEventListener);
        }
      }
    }]);

    return FontPicker;
  }();

  exports.FontManager = FontManager;
  exports.FontPicker = FontPicker;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
