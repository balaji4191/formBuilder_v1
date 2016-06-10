/*!
   angular-form-gen v0.1.0-beta.7
   (c) 2016 (null) McNull https://github.com/McNull/angular-form-gen
   License: MIT
*/
(function(angular) {
var pageCount = 0;
var fg = angular.module('fg', ['dq']);

/**
 * Constructor for form-gen Field types.
 * @param {string} type         Indicates the type of field
 * @param {object} properties   [optional] Initial property values
 */
fg.constant('FgField', function FgField(type, properties) {
    this.name = this.type = type;

    if (properties) {
      angular.extend(this, properties);
    }

    this.displayName = this.displayName || this.type.charAt(0).toUpperCase() + this.type.substring(1);
  }
);

fg.config(["$provide", function ($provide) {

  $provide.provider('fgConfig', function () {

    var config = {
      enableDebugInfo: true,
      validation: {
        messages: {},
        patterns: {}
      },
      fields: {
        templates: [],
        categories: {},
        renderInfo: {}
      }
    };

    var templates = config.fields.templates;

    function indexOfTemplate(type) {
      var idx = templates.length;

      while (idx--) {
        if (templates[idx].type === type) {
          break;
        }
      }

      return idx;
    }

    return {
      debug: function (value) {
        config.enableDebugInfo = value;
      },
      fields: {
        add: function (objectTemplate, categories, templateUrl, propertiesTemplateUrl) {

          if (!objectTemplate || !objectTemplate.type || !categories || !categories.length) {
            throw new Error('Need a valid objectTemplate and at least one category');
          }

          var idx = indexOfTemplate(objectTemplate.type);

          if (idx !== -1) {
            templates[idx] = objectTemplate;
          } else {
            templates.push(objectTemplate);
          }

          this.category(objectTemplate.type, categories);
          this.renderInfo(objectTemplate.type, templateUrl, propertiesTemplateUrl);
        },
        remove: function (type) {
          var idx = indexOfTemplate(type);

          if (idx !== -1) {
            templates.splice(idx, 1);
          }

          this.category(type);
          this.renderInfo(type);
        },
        get: function(type) {
          var i = templates.length;
          while(i--) {
            var t = templates[i];
            if(t.type === type) {
              return t;
            }
          }
        },
        renderInfo: function (fieldType, templateUrl, propertiesTemplateUrl) {
          config.fields.renderInfo[fieldType] = {
            templateUrl: templateUrl,
            propertiesTemplateUrl: propertiesTemplateUrl
          };
        },
        category: function (fieldType, categories) {
          if (!angular.isArray(categories)) {
            categories = [categories];
          }

          angular.forEach(config.fields.categories, function (category) {
            delete category[fieldType];
          });

          angular.forEach(categories, function (category) {
            if (config.fields.categories[category] === undefined) {
              config.fields.categories[category] = {};
            }

            config.fields.categories[category][fieldType] = true;
          });
        }
      },
      validation: {
        message: function (typeOrObject, message) {

          var messages = config.validation.messages;

          if (angular.isString(typeOrObject)) {

            if (!message) {
              throw new Error('No message specified for ' + typeOrObject);
            }

            messages[typeOrObject] = message;
          } else {
            angular.extend(messages, typeOrObject);
          }
        },
        pattern: function (nameOrObject, pattern) {

          if (angular.isString(nameOrObject)) {
            config.validation.patterns[nameOrObject] = pattern;
          } else {
            angular.extend(config.validation.patterns, nameOrObject);
          }
        }
      },
      $get: function () {
        return config;
      }
    };
  });

}]);

fg.config(["fgConfigProvider", "FgField", function (fgConfigProvider, FgField) {

  // - - - - - - - - - - - - - - - - - - - - - -
  // Messages
  // - - - - - - - - - - - - - - - - - - - - - -

  fgConfigProvider.validation.message({
    required: 'A value is required for this field.',
    minlength: 'The value does not match the minimum length{{ field.schema && (" of " + field.schema.validation.minlength + " characters" || "")}}.',
    maxlength: 'The value exceeds the maximum length{{ field.schema && (" of " + field.schema.validation.maxlength + " characters" || "")}}.',
    pattern: 'The value "{{ field.state.$viewValue }}" does not match the required format.',
    email: 'The value "{{ field.state.$viewValue }}" is not a valid email address.',
    unique: 'The value "{{ field.state.$viewValue }}" is already in use.',
    number: 'The value "{{ field.state.$viewValue }}" is not a number.',
    dates: 'The value "{{ field.state.$viewValue }}" is not a date.',
    min: 'The value {{ field.schema && ("should be at least " + field.schema.validation.min) || field.state.$viewValue + " is too low" }}',
    max: 'The value {{ field.schema && ("should be less than " + field.schema.validation.max) || field.state.$viewValue + " is too high" }}',
    minoptions: 'At least {{ field.schema.validation.minoptions }} option(s) should be selected.',
    maxoptions: 'No more than {{ field.schema.validation.maxoptions }} option(s) should be selected.',
	  email: 'Email address is invalid. Please provide a valid email address',
    paragraph: 'Please provide ‘Paragraph title',
    checkbox: 'Please select an option',
    radiobutton: 'Please select an option',
    dropdownsingleselect: 'Please select an option',
    dropdownmultiselect: 'Please select atleast one option',
    textbox: 'Please enter "Textbox Title"',
    textarea: 'Please enter "TextArea Title"',
    numbermessage: 'Please enter "Number Title"',
    date: 'Please select the date',
    phonenumber: 'Please enter "Phone Number"',
    address: 'Please enter "Address"',
    reCaptcha: 'Please select the reCaptcha checkbox',
    image: 'Please upload an image'
  });

  // - - - - - - - - - - - - - - - - - - - - - -
  // Fields
  // - - - - - - - - - - - - - - - - - - - - - -

  var categories = {
    'Text input fields': [
      new FgField('heading', {
        displayName: 'Header',
        fieldwidth: 'high',
		glypclassName:'fa fa-header'
      }),
	  new FgField('image', {
        displayName: 'Image',
        fieldwidth: 'high',
		glypclassName:'fa fa-picture-o'
      }), 
	  new FgField('shortanswer', {
        displayName: 'Short Answer',
        fieldwidth: 'high',
		glypclassName:'fa fa-keyboard-o'
      }),

	  new FgField('date', {
		glypclassName:'datepicker',
        glypclassName:'fa fa-calendar',
        fieldwidth: 'high'
      }),
	     new FgField('longanswer', {
        displayName: 'Long Answer',
        fieldwidth: 'high',
		glypclassName:'fa fa-list-alt'
      }),
	  new FgField('phoneNumber',{
		displayName: 'Phone Number',
    fieldwidth: 'high',
		glypclassName:'fa fa-phone',
      }),
	  new FgField('paragraph', {
        displayName: 'Paragraph',
        fieldwidth: 'high',
		glypclassName:'fa fa-paragraph'
		
      }),
      new FgField('email',{
		displayName: 'Email',
    fieldwidth: 'high',
		glypclassName:'fa fa-envelope-o'
	  }),
	  new FgField('selectlist', {
        displayName: 'Dropdown List',
        fieldwidth: 'high',
		glypclassName:'fa fa-chevron-circle-down',
        options: [
          {
            value: '1',
            text: 'Option 1'
          },
          {
            value: '2',
            text: 'Option 2'
          },
          {
            value: '3',
            text: 'Option 3'
          } 
        ]
      }),
      
      new FgField('address',{
		glypclassName:'fa fa-map-marker',
    fieldwidth: 'high',
			address:{
				valueAddname : "Name",
				valueStreet : "Street",
				valueCity : "City",
				valueState : "State",
				valueZip : "Zip"
			}
	  }), 
	  new FgField('radiobuttonlist', {
        displayName: 'Radiobutton',
        fieldwidth: 'high',
		glypclassName:'fa fa-dot-circle-o',		
	    layout_option:'horizontal',
	    fieldwidth:'high',
        options: [
           {
            value: '1',
            text: 'Option 1'
          },
          {
            value: '2',
            text: 'Option 2'
          },
          {
            value: '3',
            text: 'Option 3'
          } 
        ]
      }),
	 /* new FgField('button',{
	      displayName: 'Button',
        glypclassName: 'button2x'
      }), */
	  //new FgField('checkbox', { nolabel: true }),
      new FgField('checkboxlist', {
        displayName: 'Check Box',
        fieldwidth: 'high',
		glypclassName:'fa fa-check-square-o',
		layout_option:'horizontal',
        options: [
           {
            value: '1',
            text: 'Option 1'
          },
          {
            value: '2',
            text: 'Option 2'
          },
          {
            value: '3',
            text: 'Option 3'
          } 
        ]
      }),
      new FgField('sectionbreak',{
		    displayName: 'Section Break', 
        fieldwidth: 'high',
		  glypclassName: 'fa fa-arrows-h' 
	  }),
      
	  /* new FgField('number', {
		 displayName: 'Number',
		glypclassName:'number2x',		 
        validation: { maxlength: 15 } //to prevent > Number.MAX_VALUE
      }), */
	   new FgField('codeblock',{
		    displayName: 'Code Block',
        fieldwidth: 'high', 
		glypclassName: 'fa fa-code'		
	  }), 
    ]
  };

  angular.forEach(categories, function (fields, category) {
    angular.forEach(fields, function (field) {
	//debugger
      fgConfigProvider.fields.add(field, category /*, templateUrl, propertiesTemplateUrl */);
    });
  });

  // - - - - - - - - - - - - - - - - - - - - - -
  // Patterns
  // - - - - - - - - - - - - - - - - - - - - - -

  fgConfigProvider.validation.pattern({
    'None': undefined,
    'Url': '^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$',
    'Domain': '^([a-z][a-z0-9\\-]+(\\.|\\-*\\.))+[a-z]{2,6}$',
    'IPv4 Address': '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    'Email Address': '^([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})$',
    'Integer': '^-{0,1}\\d+$',
    'Positive Integers': '^\\d+$',
    'Negative Integers': '^-\\d+$',
    'Number': '^-{0,1}\\d*\\.{0,1}\\d+$',
    'Positive Number': '^\\d*\\.{0,1}\\d+$',
    'Negative Number': '^-\\d*\\.{0,1}\\d+$',
    'Year (1920-2099)': '^(19|20)[\\d]{2,2}$',
    'Password': '(?=.*\\d)(?=.*[!@#$%^&*\\-=()|?.\"\';:]+)(?![.\\n])(?=.*[A-Z])(?=.*[a-z]).*$'
  });
}]);

// ATTENTION!
// DO NOT MODIFY THIS FILE BECAUSE IT WAS GENERATED AUTOMATICALLY
// SO ALL YOUR CHANGES WILL BE LOST THE NEXT TIME THE FILE IS GENERATED
angular.module('fg').run(['$templateCache', function($templateCache){
$templateCache.put('angular-form-gen/edit/edit.ng.html', '<div class=\"fg-edit form-group\" ng-form=\"$fg\"><div class=\"col-sm-3 nam-form-drag\" ng-form=\"$palette\" fg-null-form=\"\"><div class=\"nam-form-edit-sec\"><fieldset><div data=\"{{list}}\" ng-repeat=\"list in schema track by $index\" id=\"fgEditFieldCanvas{{$index}}\" class=\"fg-edit-canvas-field-area\" ><div id=\"fbEditFieldEle{{$parent.$index}}{{$index}}\" class=\"fb-edit-field-block\" ng-repeat=\"field in list.fields track by $index\"><div class=\"closeIcon\" ng-click=\"toggleProperties(field, $parent.$index,$index)\"><i class="fa fa-arrow-circle-left"></i>Close</div><div fg-edit-canvas-field=\"\"></div></div></div></fieldset></div><div ng-if="value.showField" fg-form=\"\" fg-edit-palette=\"\" fg-no-render=\"true\"></div><div ng-if="value.showField"><div class=\"form-extras\"><legend>Form Extras </legend><label for=\"\">Language</label><div class=\"form-drop-down pull-right\"><select class=\"fullwidth-input\" style=\"color:black\"><option>Select Option</option><option label=\"Afrikaans\" value=\"string:af\">Afrikaans</option><option label=\"Arabic\" value=\"string:ar\">Arabic</option><option label=\"Bulgarian\" value=\"string:bg\">Bulgarian</option><option label=\"Chinese\" value=\"string:zh\">Chinese</option><option label=\"Chinese (Traditional)\" value=\"string:zz\">Chinese (Traditional)</option><option label=\"Danish\" value=\"string:da\">Danish</option><option label=\"Dutch\" value=\"string:nl\">Dutch</option><option label="English" value=\"string:en\" selected=\"selected\">English</option><option label=\"Finnish\" value=\"string:fi\">Finnish</option><option label=\"French\" value=\"string:fr\">French</option><option label=\"German\" value=\"string:de\">German</option><option label=\"Greek\" value=\"string:el\">Greek</option><option label=\"Hebrew\" value=\"string:he\">Hebrew</option><option label="\Hungarian\" value="\string:hu\">Hungarian</option><option label=\"Italian\" value=\"string:it\">Italian</option><option label=\"Japanese\" value=\"string:ja\">Japanese</option><option label=\"Korean\" value=\"string:ko\">Korean</option><option label=\"Norwegian (Bokmål)\" value=\"string:no\">Norwegian (Bokmål)</option><option label=\"Russian\" value=\"string:ru\">Russian</option><option label=\"Spanish\" value=\"string:es\">Spanish</option><option label=\"Swedish\" value=\"string:sv\">Swedish</option><option label=\"Polish\" value=\"string:pl\">Polish</option><option label=\"Portuguese\" value=\"string:pt\">Portuguese</option><option label=\"Thai\" value=\"string:th\">Thai</option><option label=\"Turkish\" value=\"string:tr\">Turkish</option></select></div></div><br><div class="form-extras"><label for=\"\">reCAPTCHA</label><div class=\"form-extras-checkbox\"><input type=\"checkbox\" name=\"checkbox1\" id=\"checkbox1\" class=\"ios-toggle\" ng-model=\"extracts.reCaptcha\"><label for="\checkbox1\" class="\checkbox-label fg-form-fields\" data-off=\"\" data-on=\"\"></label></div></div><br><div class="form-extras"><label for=\"\">Locations Prompt</label><div class="form-extras-checkbox"><input type=\"checkbox\" name=\"checkbox2\" id=\"checkbox2\" class=\"ios-toggle\" ng-model=\"extracts.location\"><label for=\"checkbox2\" class=\"checkbox-label\" data-off=\"\" data-on=\"\"></label></div></div><br><div class="form-extras"><label for=\"\">Social Media Sign-In</label><div class="form-extras-checkbox"><input type=\"checkbox\"  ng-model=\"extracts.media\" name=\"checkbox3\" id=\"checkbox3\" class=\"ios-toggle\"><label for="\checkbox3\" class=\"checkbox-label\" data-off=\"\" data-on=\"\"></label></div></div><br><div class="form-extras"><label for=\"\">Registration</label><div class="form-extras-checkbox"><input type=\"checkbox\" name=\"checkbox4\" id=\"checkbox4\" class=\"ios-toggle\" ng-model=\"extracts.registeration\"><label for=\"checkbox4\" class=\"checkbox-label\" data-off=\"\" data-on=\"\"></label></div></div><br><div class="form-extras"><label for=\"\">Cookies Tracking</label><div class="form-extras-checkbox"><input type=\"checkbox\" name=\"checkbox5\" id=\"checkbox5\" class=\"ios-toggle\" ng-model=\"extracts.cookies\"><label for=\"checkbox5\" class=\"checkbox-label\" data-off=\"\" data-on=\"\"></label></div></div><br><div class="form-extras"><label for=\"\">IP Tracking</label><div class="form-extras-checkbox"><input type=\"checkbox\" name=\"checkbox6\" id=\"checkbox6\" class=\"ios-toggle\" ng-model=\"extracts.ipTracking\"><label for=\"checkbox6\" class=\"checkbox-label\" data-off=\"\" data-on=\"\"></label></div></div><br><div class="form-extras"><label for=\"\">Enable SSL</label><div class="form-extras-checkbox"><input ng-model=\"extracts.ssl\" type=\"checkbox\" name=\"checkbox7\" id=\"checkbox7\" class=\"ios-toggle\"><label for=\"checkbox7\" class=\"checkbox-label\" data-off=\"\" data-on=\"\"></label></div></div><br><div class="form-extras"><label for=\"\">Set Analytics</label><div class="form-extras-checkbox"><input type=\"checkbox\" name=\"checkbox8\" id=\"checkbox8\" class=\"ios-toggle\" ng-model=\"extracts.analytics\"><label for=\"checkbox8\" class=\"checkbox-label\" data-off=\"\" data-on=\"\"></label><br></div></div></div><div ng-if="value.showTheme" ng-include=\"\'themetemplates.html\' \"></div><div ng-if="value.showcreateTheme" ng-include=\"\'createthemetemplates.html\' \"></div><div class=\"paletteControl\"><button class=\"fieldButton\" ng-click=\"fieldClick()\">Fields</button><button ng-click=\"themeClick()\" class=\"fieldButton\">Themes</button></div></div><div class=\"col-sm-9 nam-form-width\"><div class=\"schemaEdit\"><button ng-click=\"submitForm()\">SAVE</button><button>CANCEL</button><button ng-click=\"submitForm()\">SUBMIT</button></div><div fg-form=\"\" fg-edit-canvas=\"\" fg-no-render=\"true\"></div></div><style parse-style>.nam-form .fg-edit-canvas-area{background: {{object.quickstyles.angular_variable}};font-family:{{object.quickstyles.fontfamily}};font-size: {{object.quickstyles.slider_toggle.value}}px;}.fg-edit-canvas .fg-field.fg-edit-canvas-field{margin-bottom: {{object.quickstyles.slider_toggle_space.value}}px} .high{background: {{object.advanceStyles.general.formBackground}};border-radius:{{object.advanceStyles.general.formBorder}}px} .fg-edit-canvas-area .labelform{color:{{object.advanceStyles.formFields.fieldLabelText}};text-align:{{object.advanceStyles.formFields.labelPosition}} !important} .form-control{background-color:{{object.advanceStyles.formFields.fieldBackground}};border-color:{{object.advanceStyles.formFields.fieldBorder}};border-radius:{{object.advanceStyles.formFields.roundCorners}}px} .fg-edit-canvas-area .fgsupportingtext{color:{{object.advanceStyles.formFields.supportingText}}} .form-control{border-radius:{{object.quickstyles.styles}}px}</style></div> ');
  //Themes Template
 $templateCache.put('themetemplates.html','<div class=\"themeContainer\" ><div class=\"themeuseContainer themeUseStyle\" ><div class=\"themeUseSmall\"><span class=\"glyphicon glyphicon-{{themeglypicon.themeglyp}}\"></span><span data-toggle=\"collapse\" data-target=\"#themeusecollapse\"> Theme In Use </span></div><div id=\"themeusecollapse\" class=\"collapse\">Form Stack Light</div></div><br><div class=\"createButton\"><button ng-click=\"createthemeClick()\">Create Theme</button></div></br><div class=\"themeNotuseContainer themeNotUseStyle\"><div class=\"theneNotUseSmall\"><span class=\"glyphicon glyphicon-{{themeglypicon.themeglyp}}\"></span><span data-toggle=\"collapse\" data-target=\"#themeNotusecollapse\">Theme Not In Use</span></div><div id=\"themeNotusecollapse\" class=\"collapse\">Form Stack Light not in use</div></div></div>');
  //CreateTheme Template
  $templateCache.put('createthemetemplates.html','<div class=\"themeContainer\" ><div class=\"themeuseContainer themeUseStyle\" ><div class=\"themeUseSmall\"><span class=\"glyphicon glyphicon-{{themeglypicon.themeglyp}}\"></span><span data-toggle=\"collapse\" data-target=\"#themeusecollapse\"> Quick Styles </span></div><div id=\"themeusecollapse\" class=\"collapse\" ng-include=\"\'themeQuicStyles.html\'\"></div></div><br></br> <div class=\"themeNotuseContainer themeNotUseStyle\"><div class=\"theneNotUseSmall\"><span class=\"glyphicon glyphicon-{{themeglypicon.themeglyp}}\"></span><span data-toggle=\"collapse\" data-target=\"#themeNotusecollapse\">Advanced Styles</span></div><div id=\"themeNotusecollapse\" class=\"collapse\" ng-include=\"\'themeAdvanceStyles.html\'\"> Form Advance Styles Include </div></div> <br><br> <div class=\"themeNotuseContainer themeNotUseStyle\"><div class=\"theneNotUseSmall\"><span class=\"glyphicon glyphicon-{{themeglypicon.themeglyp}}\"></span><span data-toggle=\"collapse\" data-target=\"#themeDetailscollapse\">Theme Details</span></div><div id=\"themeDetailscollapse\" class=\"collapse\" > <div><span>created on</span><br><span>Last Edited Made on</span><br><span>Currently in use on</span></div></div></div><br><br><div class=\"themeNotuseContainer themeNotUseStyle\"><div class=\"theneNotUseSmall\"><span class=\"glyphicon glyphicon-{{themeglypicon.themeglyp}}\"></span><span data-toggle=\"collapse\" data-target=\"#themeAdCodeEditcollapse\">Advanced Code Editor</span></div><div id=\"themeAdCodeEditcollapse\" class=\"collapse\" >value1 </div></div>');
  //theme QuickStyles
  $templateCache.put('themeQuicStyles.html', '<div class=\"quickStylescontainer\"><div><label>Form Colors</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button></div> <div><label>Form Font</label><select name="singleSelect" ng-model=\"object.quickstyles.fontfamily\"><option value=\'\"Helvetica Neue\",Helvetica,Arial,sans-serif\'>Helvetica Neue</option><option value=\"serif\">serif</option></select></div><div><label>Font Size</label><rzslider rz-slider-model=\"object.quickstyles.slider_toggle.value\" rz-slider-high=\"object.quickstyles.slider_toggle.maxValue\" rz-slider-options=\"object.quickstyles.slider_toggle.options\"></rzslider></div><div><label>Spacing</label><rzslider rz-slider-model=\"object.quickstyles.slider_toggle_space.value\" rz-slider-high=\"object.quickstyles.slider_toggle_space.maxValue\" rz-slider-options=\"object.quickstyles.slider_toggle_space.options\"></rzslider></div><div><div><label>styles</label><input class=\"\" type=\"radio\" value=\"4\" ng-model=\"object.quickstyles.styles\">rounded</input><input class=\"\" type=\"radio\" value=\"0\" ng-model=\"object.quickstyles.styles\">square</input></div></div></div>');
  
  //theme Advance Styles Main Element Creation
  $templateCache.put('themeAdvanceStyles.html', '<div class=\"adStylescontainer\"><div  class=\"advancethemes\"><label data-toggle=\"collapse\" data-target=\"#themegeneralcollapse\">General</label><div id=\"themegeneralcollapse\" class=\"collapse\" ng-include=\"\'themeAdvanceGeneral.html\'\"></div></div> <div class=\"advancethemes\"><label data-toggle=\"collapse\" data-target=\"#themeformfieldscollapse\">Form Fields</label><div id=\"themeformfieldscollapse\" class=\"collapse\" ng-include=\"\'themeAdvanceFormfields.html\'\"></div></div><div class=\"advancethemes\"><label  data-toggle=\"collapse\" data-target=\"#themebuttonscollapse\">Buttons</label><div id=\"themebuttonscollapse\" class=\"collapse\" ng-include=\"\'themeAdvanceButton.html\'\"></div></div><div class=\"advancethemes\"><label data-toggle=\"collapse\" data-target=\"#themeAdvanceFieldsscollapse\">Advanced Fields</label><div id=\"themeAdvanceFieldsscollapse\" class=\"collapse\" ng-include=\"\'themeAdvanceFieldAdvance.html\'\"></div></div> <div class=\"advancethemes\"><label data-toggle=\"collapse\" data-target=\"#themesectioncollapse\">Sections</label><div id=\"themesectioncollapse\" class=\"collapse\" ng-include=\"\'themeAdvanceSection.html\'\"></div> <div class=\"advancethemes\"><label data-toggle=\"collapse\" data-target=\"#themeaddcomponentscollapse\">Additional Components</label><div id=\"themeaddcomponentscollapse\" class=\"collapse\" ng-include=\"\'themeAdvanceAddComponents.html\'\"></div></div>');
  
  //theme Advance 'General' Element Creation
	$templateCache.put('themeAdvanceGeneral.html', '<div class=\"adGeneralcontainer\"> <div><label>Form alingment</label><select name="singleSelect" ng-model=\"object.quickstyles.formalignment\"><option value=\"Left\">Left</option><option value=\"Center\">Center</option><option value=\"right\">Right</option></select></div><div><label>Page Background</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button></div><div><label>Form Background</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.advanceStyles.general.formBackground\">Change Color</button></div><div><div><label>Form border</label><input class=\"\" type=\"checkbox\" value=\"rounded\" ng-model=\"object.advanceStyles.general.formBorder\" ng-true-value=\"4\" ng-false-value=\"0\"></input><label>Round Corners</label></div></div></div>');
	
//theme Advance 'Form fields' Element Creation
	$templateCache.put('themeAdvanceFormfields.html', '<div class=\"adFormfieldscontainer\"><div><label>Field Label Text </label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.advanceStyles.formFields.fieldLabelText\">Change Color</button></div><div><label>Supporting Text</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.advanceStyles.formFields.supportingText\">Change Color</button></div><div ng-include=\"\'themeDefaultSelectFormfields.html\'\"></div><div><label>Field Background</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.advanceStyles.formFields.fieldBackground\">Change Color</button></div><div><label>Field Border</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.advanceStyles.formFields.fieldBorder\">Change Color</button><input class=\"\" type=\"checkbox\" value=\"rounded\" ng-model=\"object.advanceStyles.formFields.roundCorners\" ng-true-value=\"4\" ng-false-value=\"0\"></input><label>Round Corners</label></div><div><label>Active Field Highlight </label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button></div> <div><label>Field Animiation</label><input class=\"\" type=\"checkbox\" value=\"rounded\"></input><label>Enabled</label></div> <div><label>Required Field border</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button></div> <div><label>Required border</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button></div> <div><label>Required asterisk</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button></div> <div><label>Label Position</label><select name="singleSelect" ng-model=\"object.advanceStyles.formFields.labelPosition\"><option value=\"left\">Left</option><option value=\"center\">Center</option><option value=\"right\">Right</option></select></div>  </div>');

// theme Text Default Input Fields Text
		$templateCache.put('themeDefaultSelectFormfields.html', '<label>Field Input Text </label><select name="singleSelect" ng-model=\"object.quickstyles.formalignment\"><option value=\"Thin\">Thin</option><option value=\"ThinItalic\">ThinItalic</option><option value=\"Light\">Light</option><option value=\"LightItalic\">LightItalic</option><option value=\"Normal\">Normal</option><option value=\"Italic\">Italic</option><option value=\"Bold\">Bold</option><option value=\"BoldItalic\">BoldItalic</option><option value=\"Heavey\">Heavey</option><option value=\"HeaveyItalic\">HeaveyItalic</option></select></div>');
		
	// theme Heading alignment Input Fields Text
		$templateCache.put('themeDefaultSelectHeading.html', '<select name="singleSelect" ng-model=\"object.quickstyles.formalignment\"><option value=\"Thin\">Thin</option><option value=\"ThinItalic\">ThinItalic</option><option value=\"Light\">Light</option><option value=\"LightItalic\">LightItalic</option><option value=\"Normal\">Normal</option><option value=\"Italic\">Italic</option><option value=\"Bold\">Bold</option><option value=\"BoldItalic\">BoldItalic</option><option value=\"Heavey\">Heavey</option><option value=\"HeaveyItalic\">HeaveyItalic</option></select></div>');
	

	//theme advance "Buttons" Element Creation
	$templateCache.put('themeAdvanceButton.html', '<div class=\"adButtoncontainer\"> <div><label>Button Label Text</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button></div><div><label>Button Background</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.advanceStyles.general.formBackground\">Change Color</button></div><div><label>Button Border</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.advanceStyles.formFields.fieldBorder\">Change Color</button><input class=\"\" type=\"checkbox\" value=\"rounded\" ng-model=\"object.advanceStyles.formFields.roundCorners\" ng-true-value=\"4\" ng-false-value=\"0\"></input><label>Round Corners</label></div>  <div><label>Button Padding</label><input class=\"\" type=\"text\" value=\"rounded\" ng-model=\"object.advanceStyles.formFields.roundCorners\"></input><label>Px top/bottom</label><br><input class=\"\" type=\"text\" value=\"rounded\" ng-model=\"object.advanceStyles.formFields.roundCorners\"></input><label>Px left/right</label><br><select name="singleSelect" ng-model=\"object.quickstyles.formalignment\"><option value=\"Left\">Left</option><option value=\"Center\">Center</option><option value=\"right\">Right</option></select></div></div>');
	
	
	//theme advance "Advance fields" Element Creation
	$templateCache.put('themeAdvanceFieldAdvance.html', '<div class=\"adButtoncontainer\"> <div><label>Event Price Text</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button></div> <div><label>Matrix Row Label Position</label><select name="singleSelect" ng-model=\"object.quickstyles.formalignment\"><option value=\"Left\">Left</option><option value=\"Center\">Center</option><option value=\"right\">Right</option></select></div> <div><label>Matrix Column Label Position</label><select name="singleSelect" ng-model=\"object.quickstyles.formalignment\"><option value=\"Left\">Left</option><option value=\"Center\">Center</option><option value=\"right\">Right</option></select></div></div>');
	
	//theme advance " Section" Element Creation
	$templateCache.put('themeAdvanceSection.html', '<div class=\"adButtoncontainer\"> <div><label>Heading Text</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button></div> <div><label>Heading alignment</label><select name="singleSelect" ng-model=\"object.quickstyles.formalignment\"><option value=\"Left\">Left</option><option value=\"Center\">Center</option><option value=\"right\">Right</option></select><br><div ng-include=\"\'themeDefaultSelectHeading.html\'\"></div> <div><label>Container Background</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button><br><input class=\"\" type=\"checkbox\" value=\"rounded\" ng-model=\"object.advanceStyles.formFields.roundCorners\" ng-true-value=\"4\" ng-false-value=\"0\"></input><label>Round Corners</label></div></div>');
	
	//theme advance "Additional Components" Element Creation
	$templateCache.put('themeAdvanceAddComponents.html', '<div class=\"adButtoncontainer\"> <div><label>Primary</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button></div> <div><label>Secondary</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button></div> <div><label>Tertiary</label><button colorpicker type=\"button\" colorpicker-position=\"top\" ng-model=\"object.quickstyles.angular_variable\">Change Color</button></div> </div>');
	
  
  
  $templateCache.put('angular-form-gen/validation/summary.ng.html', '<ul class=\"fg-validation-summary help-block unstyled\" ng-if=\"field.state.$invalid && field.state.$dirty\"><li ng-repeat=\"(key, error) in field.state.$error\" ng-if=\"error\" fg-bind-expression=\"messages[key]\"></li></ul>');
  $templateCache.put('angular-form-gen/common/jsonify/jsonify.ng.html', '<div class=\"jsonify\"><div class=\"btn-toolbar btn-toolbar-right\"><button class=\"btn btn-default btn-xs\" type=\"button\" title=\"Copy the json data.\" ng-click=\"copy()\"><span class=\"glyphicon glyphicon-transfer\"></span></button> <button class=\"btn btn-default btn-xs\" type=\"button\" title=\"Display hidden properties.\" ng-click=\"displayHidden = !displayHidden\" ng-class=\"{ \'active\': displayHidden }\"><span class=\"glyphicon glyphicon-eye-open\"></span></button></div><pre><code>{{ jsonify | j$on:displayHidden }}</code></pre></div>');
  $templateCache.put('angular-form-gen/common/tabs/tabs-pane.ng.html','<div class=\"fg-tabs-pane\" ng-show=\"tabs.active === pane\"><div ng-show=\"tabs.active === pane || pane.renderAlways\" ng-transclude=\"\"></div></div>');
  $templateCache.put('angular-form-gen/common/tabs/tabs.ng.html', '<div class=\"fg-tabs tabbable sec-width\"><ul class=\"nav nav-tabs\"><li ng-repeat=\"tab in tabs.items\" ng-class=\"{ active: tab === tabs.active }\"><a href=\"\" ng-click=\"tabs.activate(tab)\">{{ tab.title }}</a></li></ul><div class=\"tab-content pull-left sec-width\" ng-transclude=\"\"></div></div>');
  $templateCache.put('angular-form-gen/edit/canvas/canvas.ng.html', '<div class=\"pager\" ng-if=\"schema.length>1\"><div class=\"pageBtn\"><span ng-click=\"canvasCtrl.fbPageNextEvent(true, schema.length)\"><i class="fa fa-chevron-left" aria-hidden="true"></i></span><span class=\"pageList\" ng-repeat=\"list in schema track by $index\" id=\"pageIndex_{{$index}}\" ng-if=\"countcheck==$index\">Page {{$index+1}}</span><span ng-click=\"canvasCtrl.fbPageNextEvent(false,schema.length)\"><i class="fa fa-chevron-right" aria-hidden="true"></i></span></div></div><div class=\"fg-edit-canvas\" ng-class=\"{ \'fg-edit-canvas-dragging\': dragging }\"><fieldset><div data=\"{{list}}\" ng-repeat=\"list in schema track by $index\" id=\"fgEditCanvasId_{{$index}}\" class=\"fg-edit-canvas-area fg-schema-edit-area\" dq-drag-area=\"fg-edit-canvas\" dq-drag-enter=\"canvasCtrl.dragEnter()\" dq-drag-leave=\"canvasCtrl.dragLeave()\" dq-drop=\"canvasCtrl.drop($index,schema)\"><div ng-if=\"!(schema[$index].fields.length)\"><div ng-if=\"!dragPlaceholder.visible\" class=\"fg-edit-canvas-area-empty alert alert-info text-center\"><strong>This is your blank form [Untitled Form].</strong><br><br><p>Add Fields by dragging the fields from the left sidebar to this area.</p><p>Customize the look of your form by applying Themes.</p><br><p>Or, start with a pre-made form:</p><br><select><option value="performance assessment">Performance Assessment</option><option value="employee self evaluation">Employee Self Evaluation</option><option value="job application">Job Application</option><option value="" class="" selected="selected">Select a pre-built form</option>Select a pre made form <span class="glyphicon glyphicon-triangle-bottom"></span></select></div></div><div  ><div ng-repeat=\"field in list.fields\" class=\"{{field.type}} {{field.fieldwidth}}\" ng-class=\"{\'high\':!field.fieldwidth}\"><div ng-class=\"{ \'fg-drag-placeholder-visible\' : dragPlaceholder.visible && dragPlaceholder.index === $index }\" class=\"fg-drag-placeholder\"></div><div fg-edit-canvas-field=\"\"></div></div><div ng-class=\"{ \'fg-drag-placeholder-visible\': dragPlaceholder.visible && dragPlaceholder.index == schema.fields.length }\" class=\"fg-drag-placeholder\"></div></div></div></fieldset></div>');
  $templateCache.put('angular-form-gen/edit/palette/palette.ng.html', '<div class=\"fg-edit-palette\"><fieldset><div fg-edit-palette-categories=\"\" data-category=\"selectedCategory\"></div><div ng-repeat=\"template in templates | filter:templateFilter\" class=\"fg-field col-sm-5\" dq-draggable=\"fg-edit-canvas\" dq-drag-begin=\"{ source: \'palette\', field: template }\"><div class=\"fg-field-overlay\"><div class=\"btn-toolbar btn-toolbar-right\"><button class=\"btn btn-default btn-xs btn-primary\" type=\"button\" ng-click=\"schemaCtrl.addField(template)\" title=\"Add this field.\"><span class=\"glyphicon glyphicon-plus\"></span></button></div></div><div fg-field=\"template\" fg-tab-index=\"-1\" fg-no-validation-summary=\"true\" fg-edit-mode=\"true\"></div></div></fieldset></div>');
  $templateCache.put('angular-form-gen/field-templates/default/checkbox.ng.html', '<div class=\"checkbox\"><label title=\"{{ field.schema.tooltip }}\"><input fg-field-input=\"\" id=\"{{ field.$_id }}\" type=\"checkbox\" tabindex=\"{{ tabIndex }}\" ng-model=\"form.data[field.schema.name]\"> <span ng-if=\"field.schema.nolabel\">{{ field.schema.displayName }}</span></label></div>');
/*  $templateCache.put('angular-form-gen/field-templates/default/checkboxlist.ng.html', '<div fg-checkboxlist=\"\" fg-field-input=\"\" ng-model=\"form.data[field.schema.name]\" name=\"{{ field.schema.name }}\"><div class=\"checkbox\" ng-repeat=\"option in field.schema.options\"><label title=\"{{ field.schema.tooltip }}\"><input type=\"checkbox\" tabindex=\"{{ tabIndex }}\" value=\"{{ option.value }}\" ng-model=\"form.data[field.schema.name][option.value]\"> <span>{{option.text || option.value}}</span></label></div></div>');*/
/*  $templateCache.put('angular-form-gen/field-templates/default/dropdownlist.ng.html', '<div fg-field-input=\"\" fg-dropdown-input=\"field.schema.options\" title=\"{{ field.schema.tooltip }}\" id=\"{{ field.$_id }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.validation.required\" tabindex=\"{{ tabIndex }}\" placeholder=\"{{ field.schema.placeholder }}\" ng-minlength=\"{{ field.schema.validation.minlength }}\" ng-maxlength=\"{{ field.schema.validation.maxlength }}\" ng-pattern=\"/{{ field.schema.validation.pattern }}/\"></div>');*/
/*  $templateCache.put('angular-form-gen/field-templates/default/email.ng.html', '<input class=\"form-control\" fg-field-input=\"\" type=\"email\" id=\"{{ field.$_id }}\" title=\"{{ field.schema.tooltip }}\" tabindex=\"{{ tabIndex }}\" placeholder=\"{{ field.schema.placeholder }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.validation.required\" ng-minlength=\"{{ field.schema.validation.minlength }}\" ng-maxlength=\"{{ field.schema.validation.maxlength }}\" ng-pattern=\"/{{ field.schema.validation.pattern }}/\">');*/
  $templateCache.put('angular-form-gen/field-templates/default/not-in-cache.ng.html', '<div class=\"fg-field-not-in-cache alert alert-error\"><p>No template registered in cache for field type \"{{ field.type }}\".</p></div>');
  
  //heading
  $templateCache.put('angular-form-gen/field-templates/default/heading.ng.html', '<hr><div class=\"headerFields\" supportingtext=\"{{ field.schema.supportingtext }}\" ng-pattern=\"/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/\"></div><p class=\"fgsupportingtext\"> {{field.schema.supportingtext}}</p>');
  $templateCache.put('angular-form-gen/field-templates/properties/heading.ng.html','<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{displayname: true, supportingtext: true, fieldwidth: true}\"></div></div>');

  //Short Answer
  $templateCache.put('angular-form-gen/field-templates/default/shortanswer.ng.html', '<input class=\"form-control\" fg-field-input=\"\" type=\"text\" placeholder=\"{{ field.schema.placeholder }}\" supportingtext=\"{{ field.schema.supportingtext }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.required\" ng-readonly=\"field.schema.readonly\"><p class=\"fgsupportingtext\"> {{field.schema.supportingtext}}</p>');
  $templateCache.put('angular-form-gen/field-templates/properties/shortanswer.ng.html','<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{displayname: true,fieldoption:true, supportingtext:true, placeholder: true, fieldwidth:true, fieldsize:true}\"></div></div>');

  //Long Answer
  $templateCache.put('angular-form-gen/field-templates/default/longanswer.ng.html', '<textarea class=\"form-control\" fg-field-input=\"\" rows=\"6\" columns=\"50\" type=\"text\" placeholder=\"{{ field.schema.placeholder }}\" supportingtext=\"{{ field.schema.supportingtext }}\"  ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.required\" ng-readonly=\"field.schema.readonly\"></textarea><p class=\"fgsupportingtext\">{{field.schema.supportingtext}}</p>');
  $templateCache.put('angular-form-gen/field-templates/properties/longanswer.ng.html','<div fg-tabs-pane="\Properties\"><div fg-property-field-common=\"{displayname: true,fieldoption:true, supportingtext:true, placeholder: true,fieldwidth:true,fieldsize:true }\"</div></div>');

  //PhoneNumber
  $templateCache.put('angular-form-gen/field-templates/default/phoneNumber.ng.html', '<input class=\"form-control\" fg-field-input=\"\" type=\"number\" ng-maxlength=\"15\" placeholder=\"{{ field.schema.placeholder }}\"supportingtext=\"{{ field.schema.supportingtext }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.required\"ng-readonly=\"field.schema.readonly\" ng-pattern=\"/^([0|\+[0-9]{1,5})?([1-9][0-9]{9})$/\"><p class=\"fgsupportingtext\">{{field.schema.supportingtext}}</p>');
  $templateCache.put('angular-form-gen/field-templates/properties/phoneNumber.ng.html','<div fg-tabs-pane="\Properties\"><div fg-property-field-common=\"{displayname: true,fieldoption:true,  placeholder:true, supportingtext:true, fieldwidth: true}\"></div></div>');

  //Email
  $templateCache.put('angular-form-gen/field-templates/default/email.ng.html', '<input class=\"form-control\" fg-field-input=\"\" type=\"email\" id=\"{{ field.$_id }}\" title=\"{{ field.schema.tooltip }}\" tabindex=\"{{ tabIndex }}\" placeholder=\"{{ field.schema.placeholder }}\"supportingtext=\"{{ field.schema.supportingtext }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.required\" ng-readonly=\"field.schema.readonly\" ng-minlength=\"{{ field.schema.minlength }}\" ng-maxlength=\"{{ field.schema.maxlength }}\" ng-pattern=\"/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/\"><p class=\"fgsupportingtext\">{{field.schema.supportingtext}}</p>');
  $templateCache.put('angular-form-gen/field-templates/properties/email.ng.html','<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{displayname: true, supportingtext:true,placeholder:true,fieldwidth:true,fieldoption_validate:true}\"</div><div fg-property-field-value=\"\"><input type=\"email\" class=\"form-control\" name=\"fieldValue\" ng-model=\"field.value\"></div></div>');

  //Date
  $templateCache.put('angular-form-gen/field-templates/default/date.ng.html','<div ng-controller="MyController"><div><input type=\"date\" kendo-date-picker ng-required=\"field.schema.required\" ng-readonly=\"field.schema.readonly\" placeholder="Please select a date" supportingtext=\"{{ field.schema.supportingtext }}\" ng-model=\"form.data[field.schema.name]\"></div></div><p class=\"fgsupportingtext\">{{field.schema.supportingtext}}</p>');
  $templateCache.put('angular-form-gen/field-templates/properties/date.ng.html','<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{displayname: true,fieldoption:true, supportingtext:true,defaultvalue_date:true,placeholder: true,fieldwidth:true }\"</div></div>');

  //Address
  $templateCache.put('angular-form-gen/field-templates/default/address.ng.html','<input class=\"form-control\" id=\"{{field.name}}1\" ngIf=\"{{field.name}}\" type="text" name="Name" ng-model=\"form.data[field.schema.address.valueAddname]\"/><br><input class=\"form-control\" type="text" name="Street Address" ng-model=\"form.data[field.schema.address.valueStreet]\"/><br><input class=\"form-control\" type="text" rows="1" columns="10" style="width:500px; height:40px;" name="City" ng-model=\"form.data[field.schema.address.valueCity]\"/><p>City</p><select class=\"form-control\" rows="1" columns="10" style="width:350px; height:40px;"ng-model=\"form.data[field.schema.address.valueState]\"><option value=""></option></select><p>State</p><input type="text" class=\"form-control\" rows="1" columns="10" style="width:100px; height:40px;" name="Zipcode" ng-model=\"form.data[field.schema.address.valueZip]\"/ supportingtext=\"{{ field.schema.supportingtext }}\"><p>Zipcode</p><p class=\"fgsupportingtext\">{{field.schema.supportingtext}}</p>');
  $templateCache.put('angular-form-gen/field-templates/properties/address.ng.html','<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{displayname: true , fieldoption:true, supportingtext: true, fieldwidth:true,country_dropdown:true,format_countryaddress:true}\"</div></div>');

  //Image
  $templateCache.put('angular-form-gen/field-templates/default/image.ng.html','<img class=\"fbPreviewImg\" id=\"image{{field.schema.name}}\" ng-src=\"{{form.data[field.schema.name]}}\"/><input class=\"fbSchemaImg\" myid=\"{{field.schema.name}}\" type="file" supportingtext=\"{{ field.schema.supportingtext }}\" fileread=\"form.data[field.schema.name]\" ng-model=\"form.data[field.schema.name]\"/></div><p class=\"fgsupportingtext\">{{field.schema.supportingtext}}</p>');
  $templateCache.put('angular-form-gen/field-templates/properties/image.ng.html','<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{ supportingtext: true, displayname:true ,filepath:true }\"></div></div>');


  //Dropdownlist
  $templateCache.put('angular-form-gen/field-templates/default/selectlist.ng.html','<div fg-field-input=\"\" fg-dropdown-input=\"field.schema.options\" title=\"{{ field.schema.tooltip }}\" id=\"{{ field.$_id }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.required\" tabindex=\"{{ tabIndex }}\" placeholder=\"{{ field.schema.placeholder }}\" supportingtext=\"{{ field.schema.supportingtext }}\"></div><p class=\"fgsupportingtext\">{{field.schema.supportingtext}}</p>');
  $templateCache.put('angular-form-gen/field-templates/properties/selectlist.ng.html','<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{displayname:true,fieldoption:true, supportingtext:true,fieldwidth:true,dropdownoption:true}\"</div><div fg-property-field-value=\"\"><input type=\"dropdownlist\" class=\"form-control\" name=\"fieldValue\" ng-model=\"field.value\"></div></div>');

  //Radiobuttonlist
  $templateCache.put('angular-form-gen/field-templates/default/radiobuttonlist.ng.html','<div fg-radioboxlist=\"\"><div class=\"radio\" ng-repeat=\"option in field.schema.options\" data=\"{{field}}\" ng-class=\"{\'fb-vertical\':field.schema.layout_option==\'vertical\', \'fb-horizontal\':field.schema.layout_option==\'horizontal\'}\"><label title=\"{{ field.schema.tooltip }}\"><input fg-field-input=\"\" type=\"radio\" name=\"{{ field.schema.name }}[]\" tabindex=\"{{ tabIndex }}\" value=\"{{ option.value }}\" supportingtext=\"{{ field.schema.supportingtext }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.required\"><span>{{option.text}}</span></label></div></div><p class=\"fgsupportingtext\">{{field.schema.supportingtext}}</p>');
  $templateCache.put('angular-form-gen/field-templates/properties/radiobuttonlist.ng.html','<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{displayname: true , fieldoption:true, supportingtext:true, fieldwidth:true, layout_option:true,listoption:true}\"></div></div>');

  //Checkboxlist
  $templateCache.put('angular-form-gen/field-templates/default/checkboxlist.ng.html','<div fg-checkboxlist=\"\" fg-field-input=\"\" name=\"{{ field.schema.name }}\" ng-model=\"form.data[field.schema.name]\"><div class=\"checkbox\" ng-class=\"{\'fb-vertical\':field.schema.layout_option==\'vertical\', \'fb-horizontal\':field.schema.layout_option==\'horizontal\'}\" ng-repeat=\"option in field.schema.options\"><label title=\"{{ field.schema.tooltip }}\"><input fg-field-input=\"\" type=\"checkbox\" tabindex=\"{{ tabIndex }}\" value=\"{{ option.value }}\" ng-model=\"form.data[field.schema.name][option.value]\" ng-required=\"field.schema.required\" ng-readonly=\"field.schema.readonly\" supportingtext=\"{{ field.schema.supportingtext }}\"><span>{{option.text}}</span></label></div></div><p class=\"fgsupportingtext\">{{field.schema.supportingtext}}</p>');
  $templateCache.put('angular-form-gen/field-templates/properties/checkboxlist.ng.html','<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{displayname: true , fieldoption:true, supportingtext:true, fieldwidth:true,layout_option:true,checkoption:true}\"></div></div>');
  
  //Paragraph
   $templateCache.put('angular-form-gen/field-templates/default/paragraph.ng.html','<textarea readonly class=\"form-control\" rows=\"3\" columns=\"30\"ng-model=\"field.schema.defaultvalue\"></textarea><p class=\"fgsupportingtext\">{{field.schema.supportingtext}}</p>');
  $templateCache.put('angular-form-gen/field-templates/properties/paragraph.ng.html','<div fg-tabs-pane="\Properties\"><div fg-property-field-common=\"{displayname: true,defaultvalue:true,fieldwidth:true}\"></div></div>');

  // Recaptcha Element
  

/*  //Button
  $templateCache.put('angular-form-gen/field-templates/default/button.ng.html','<button type="submit" value="Submit" ng-model=\"form.data[field.schema.name]\">Submit</button>');
  $templateCache.put('angular-form-gen/field-templates/properties/button.ng.html','<div fg-tabs-pane="\Properties\"><div fg-property-field-common=\"{fieldname: true, displayname: true ,fieldwidth:true }\"</div><div fg-property-field-value=\"\"><input type=\"button\" class=\"form-control\" name=\"fieldValue\" ng-model=\"field.value\"></div></div>');*/

  //Code Block
  $templateCache.put('angular-form-gen/field-templates/default/codeblock.ng.html','<hr>');
  $templateCache.put('angular-form-gen/field-templates/properties/codeblock.ng.html','<div fg-tabs-pane="\Properties\"><div fg-property-field-common=\"{displayname: true , placeholder: true}\"</div></div>');

  //Section Break
  $templateCache.put('angular-form-gen/field-templates/default/sectionbreak.ng.html','<hr>');
  $templateCache.put('angular-form-gen/field-templates/properties/sectionbreak.ng.html','<div fg-tabs-pane="\Properties\"><div fg-property-field-common=\"{fieldname: true, displayname: true ,fieldwidth:true,columns:true,labelposition:true,heading:true}\"</div><div fg-property-field-value=\"\"><input type=\"sectionbreak\" class=\"form-control\" name=\"fieldValue\" ng-model=\"field.value\"></div></div>');
  
  
  // New Component 

  /* $templateCache.put('angular-form-gen/field-templates/default/date.ng.html', '<input class=\"form-control\" fg-field-input=\"\" fg-input-date=\"\" type=\"text\" id=\"{{ field.$_id }}\" title=\"{{ field.schema.tooltip }}\" tabindex=\"{{ tabIndex }}\" placeholder=\"{{ field.schema.placeholder }}\" min=\"{{ field.schema.validation.min }}\" max=\"{{ field.schema.validation.max }}\" ng-model=\"form.data[field.schema.name]\" ng-required=\"field.schema.validation.required\" ng-minlength=\"{{ field.schema.validation.minlength }}\" ng-maxlength=\"{{ field.schema.validation.maxlength }}\" ng-pattern=\"/{{ field.schema.validation.pattern }}/\">'); */



  // Ends 

  //style for form builder
  
 /*  $templateCache.put('customStyleBuilder.css','<style parse-style>.nam-form. fg-edit-canvas-area{background: {{object.angular_variable}}</style>') */
  
 
 // New component properties 

 /* $templateCache.put('angular-form-gen/field-templates/properties/date.ng.html', '<div fg-tabs-pane=\"Properties\"><div fg-property-field-common=\"{ fieldname: true, displayname: true, placeholder: true, tooltip: true }\"></div><div fg-property-field-value=\"\"><input fg-input-dates=\"\" class=\"form-control\" type=\"text\" name=\"fieldValue\" ng-model=\"field.value\" min=\"{{ field.validation.min }}\" max=\"{{ field.validation.max }}\" ng-minlength=\"{{ field.validation.minlength }}\" ng-maxlength=\"{{ field.validation.maxlength }}\" ng-pattern=\"/{{ field.validation.pattern }}/\"></div></div><div fg-tabs-pane=\"Validation\"><div class=\"fg-property-field-validation\"><div fg-property-field=\"min\" fg-property-field-label=\"Minimum value\"><input fg-input-number=\"\" fg-field-redraw=\"\" class=\"form-control\" type=\"text\" name=\"min\" title=\"The minimum value that should be entered\" ng-model=\"field.validation.min\"></div><div ng-if=\"field.validation.min >= 0\"><div fg-edit-validation-message=\"min\"></div></div></div><div class=\"fg-property-field-validation\"><div fg-property-field=\"max\" fg-property-field-label=\"Maximum value\"><input fg-input-number=\"\" fg-field-redraw=\"\" class=\"form-control\" type=\"text\" name=\"max\" title=\"The maximum value that should be entered\" ng-model=\"field.validation.max\"></div><div ng-if=\"field.validation.max >= 0\"><div fg-edit-validation-message=\"max\"></div></div></div><div fg-property-field-validation=\"{ required: true, minlength: true, maxlength: true, pattern: true }\"></div></div>'); */

// End 
  
  $templateCache.put('angular-form-gen/form/field/field.ng.html', '<div class=\"fg-field-inner form-group\" ng-class=\"{ \'fg-field-required\': fieldSchema.required, \'has-error\': form.state[field.name].$invalid && form.state.submit}\"><label ng-if=\"!field.schema.nolabel\" class=\"col-sm-12 control-label labelform\" for=\"{{ field.$_id }}\"><i class=\"{{fieldSchema.glypclassName}}\"></i> {{ fieldSchema.displayName }}</label><div class=\"col-sm-9 nam-ele-width\" ng-class=\"{ \'col-sm-offset-3\': field.schema.nolabel }\"><div ng-include=\"renderInfo.templateUrl\"></div><div fg-validation-summary=\"\" fg-validation-messages=\"fieldSchema.validation.messages\" ng-if=\"!noValidationSummary\"></div></div></div>');
  $templateCache.put('angular-form-gen/form/form-fields/form-fields.ng.html', '<div class=\"pager\"><div class=\"pageBtn\"><span ng-click=\"fbPagePreviewNextEvent(true, form.schema.length)\"><i class="fa fa-chevron-left" aria-hidden="true"></i></span><span class=\"pageListPreview\" ng-repeat=\"list in form.schema track by $index\"  id=\"pagePreviewIndex_{{$index}}\" ng-if=\"countcheckPreview==$index\">Page {{$index+1}}</span><span ng-click=\"fbPagePreviewNextEvent(false, form.schema.length)\"><i class="fa fa-chevron-right" aria-hidden="true"></i></span></div></div><div class=\"fg-form-fields\"><fieldset><div data=\"{{form}}\" ng-repeat=\"list in form.schema track by $index\" id=\"fgEditPreviewId_{{$index}}\" class=\"fgpreviewElem\"><div ng-repeat=\"field in list.fields\" class=\"{{field.type}} {{field.fieldwidth}}\" ng-class=\"{\'high\':!field.fieldwidth}\"><div fg-field=\"field\"></div></div> </div></fieldset></div><div ng-if=\"countcheckPreview==form.schema.length-1 && extracts.reCaptcha==true\"><textarea id=\"recaptchaArea\" type=\"text\" readonly>{{recap}}</textarea><div ng-click=\"fgRecaptcha(10)\" class=\"glyphicon glyphicon-refresh\"></div><br><input type=\"text\" ng-model=\"recapInput.input\"></input><p>{{recapInput.text}}</p> </div><div><button ng-if=\"countcheckPreview==form.schema.length-1\" ng-click=\"formSubmit()\"> Submit</button></div>');
  $templateCache.put('angular-form-gen/edit/canvas/field/field.ng.html', '<div class=\"fg-field fg-field-{{ field.type }} fg-edit-canvas-field\" ng-class=\"{ \'error\': field.$_invalid, \'dragging\': field.$_isDragging }\" dq-draggable=\"fg-edit-canvas\" dq-drag-disabled=\"dragEnabled === false\" dq-drag-begin=\"canvasCtrl.dragBeginCanvasField($index, field)\" dq-drag-end=\"canvasCtrl.dragEndCanvasField(field)\"><div class=\"fg-field-overlay\" ng-mouseenter=\"dragEnabled = true\" ng-mouseleave=\"dragEnabled = false\"><div class=\"fg-field-overlay-drag-top\" dq-drag-enter=\"dragPlaceholder.index = $index\"></div><div class=\"fg-field-overlay-drag-bottom\" dq-drag-enter=\"dragPlaceholder.index = ($index + 1)\"></div><div class=\"btn-toolbar btn-toolbar-right\"><button class=\"btn btn-default btn-xs\" type=\"button\" ng-disabled=\"field.$_displayProperties && field.$_invalid\" ng-class=\"{ \'active\': field.$_displayProperties }\" ng-click=\"toggleProperties(field,$parent.$index,$index)\" title=\"Configure this field.\"><span class=\"glyphicon glyphicon-wrench\"></span></button> <button class=\"btn btn-default btn-xs\" type=\"button\" ng-click=\"schemaCtrl.swapFields($index - 1, $index)\" ng-disabled=\"$index === 0\" title=\"Move up\"><span class=\"glyphicon glyphicon-arrow-up\"></span></button> <button class=\"btn btn-default btn-xs\" type=\"button\" ng-click=\"schemaCtrl.swapFields($index, $index + 1)\" ng-disabled=\"$index === schema.fields.length - 1\" title=\"Move down\"><span class=\"glyphicon glyphicon-arrow-down\"></span></button> <button class=\"btn btn-default btn-xs btn-danger\" type=\"button\" ng-click=\"schemaCtrl.removeField($index, $parent.$index)\" title=\"Remove\"><span class=\"glyphicon glyphicon-trash\"></span></button></div></div><div ng-form=\"\" fg-null-form=\"\"><div fg-field=\"field\" fg-tab-index=\"-1\" fg-edit-mode=\"true\" fg-no-validation-summary=\"true\"></div></div><div class=\"fg-field-properties-container\" ng-class=\"{ visible: field.$_displayProperties }\"><div fg-edit-canvas-field-properties=\"field\" ng-if=\"expanded\"></div></div></div>');
  $templateCache.put('angular-form-gen/edit/palette/categories/categories.ng.html', '<legend ng-click=\"paletteCategoriesMenuOpen = !paletteCategoriesMenuOpen\" ng-class=\"{ \'open\': paletteCategoriesMenuOpen }\">Form Palette</legend>');
  $templateCache.put('angular-form-gen/edit/canvas/field/properties/properties.ng.html', '<div class=\"fg-field-properties\"><div novalidate=\"\" ng-form=\"fieldPropertiesForm\"><div fg-tabs=\"property.tabs\"><div ng-include=\"renderInfo.propertiesTemplateUrl\"></div><div fg-tabs-pane=\"Debug\" order=\"1000\" auto-active=\"false\"><div data-jsonify=\"field\"></div></div></div></div></div>');
  $templateCache.put('angular-form-gen/edit/canvas/field/properties/options/options.ng.html', '<div data=\"{{field}}\" ng-if=\"!field.options || field.options.length === 0\" ng-click=\"optionsCtrl.addOption()\" class=\"alert alert-info\"><h2>No options defined</h2><p class=\"lead\">Click here to add a new option definition to this field.</p></div><table ng-if=\"field.options.length > 0\" class=\"table-field-options\"><thead><tr><th></th><th>Value</th><th>Text</th><th><a href=\"\" class=\"btn btn-default btn-xs\" ng-click=\"optionsCtrl.addOption()\" title=\"Add a new option to the list\"><i class=\"glyphicon glyphicon-plus\"></i></a></th><th class=\"table-field-options-padding\"></th></tr></thead><tbody><tr ng-form=\"fieldOptionForm\" ng-repeat=\"option in field.options\" ng-class=\"{ \'error\': fieldOptionForm.$invalid }\"><td ng-if=\"multiple === false\"><input type=\"radio\" name=\"{{ field.name }}selection[]\" value=\"{{ option.text }}\" ng-model=\"field.value\" ng-click=\"optionsCtrl.toggleOption(option.value)\"></td><td ng-if=\"multiple === true\"><input type=\"checkbox\" name=\"{{ field.name }}selection[]\" value=\"{{ option.value }}\" ng-model=\"field.value[option.value]\"></td><td><input type=\"text\" name=\"optionValue\" ng-model=\"option.value\" class=\"form-control\" ng-required=\"field.type != \'selectlist\'\"></td><td><input type=\"text\" ng-model=\"option.text\" class=\"form-control\"></td><td><a href=\"\" class=\"btn btn-default btn-xs\" ng-click=\"optionsCtrl.removeOption($index)\" title=\"Remove this option from the list\"><i class=\"glyphicon glyphicon-trash\"></i></a></td><td></td></tr></tbody></table>');
  //added Main Properties
  $templateCache.put('angular-form-gen/edit/canvas/field/properties/property-field/common.ng.html', '<div ng-if=\"fields.fieldname\"><div fg-property-field=\"fieldName\" fg-property-field-label=\"DbReference\"><input type=\"text\" class=\"form-control\" name=\"fieldName\" ng-model=\"field.name\" ng-required=\"true\" ng-pattern=\"/^[a-zA-Z]([\\w]+)?$/\" fg-unique-field-name=\"\"></div></div><div ng-if=\"fields.displayname\"><div fg-property-field=\"displayName\" fg-property-field-label=\"Label\"><input type=\"text\" class=\"form-control\" name=\"displayName\" ng-model=\"field.displayName\"></div></div><div ng-if=\"fields.placeholder\"><div fg-property-field=\"fieldPlaceholder\" fg-property-field-label=\"Placeholder text\"><input type=\"text\" class=\"form-control\" name=\"fieldPlaceholder\" ng-model=\"field.placeholder\"></div></div><div ng-if=\"fields.tooltip\"><div fg-property-field=\"fieldTooltip\" fg-property-field-label=\"Tooltip\"><input type=\"text\" class=\"form-control\" name=\"fieldTooltip\" ng-model=\"field.tooltip\"></div></div><div ng-if=\"fields.supportingtext\"><div fg-property-field=\"fieldSupportingtext\" fg-property-field-label=\"Supporting Text\"><input type=\"text\" class=\"form-control\" name=\"fieldSupportingtext\" ng-model=\"field.supportingtext\"></div></div> <div ng-if=\"fields.fieldoption\"><div fg-property-field=\"fieldoption\" fg-property-field-label=\"Field Option\"><input  type=\"checkbox\" class=\"form-control-checkbox\" name=\"fieldoption\" ng-model=\"field.required\"></input><label>Required</label><input type=\"checkbox\" class=\"form-control-checkbox\" name=\"fieldoption\" ng-model=\"field.readonly\"></input><label>Read-only</label></div></div> <div ng-if=\"fields.defaultvalue\"><div fg-property-field=\"defaultvalue\" fg-property-field-label=\"Default Value\"><input type=\"text\" class=\"form-control\" name=\"defaultvalue\" ng-model=\"field.defaultvalue\"></div></div> <div ng-if=\"fields.fieldwidth \"><div fg-property-field=\"fieldwidth \" fg-property-field-label=\"Field Width\"><select type=\"text\" class=\"form-control-select\" name=\"fieldwidth \" ng-model=\"field.fieldwidth \"><option value=\"small\" selected >small</option><option value=\"medium\">medium</option><option value=\"high\">high</option><select></div></div> <div ng-if=\"fields.fieldsize\"><div fg-property-field=\"fieldsize\" fg-property-field-label=\"Field Size\"><input type=\"text\" class=\"form-control\" name=\"fieldsize\" ng-model=\"field.fieldsize\"></div></div> <div ng-if=\"fields.fieldoption_other\"><div fg-property-field=\"fieldoption_other\" fg-property-field-label=\"Field Option\"><input type=\"checkbox\" class=\"form-control-checkbox\" name=\"fieldoption_other\" ng-model=\"field.fieldoption_other\"></input><label>Required</label><input type=\"checkbox\" class=\"form-control-checkbox\" name=\"fieldoption_other\" ng-model=\"field.fieldoption_other\"></input><label>Add-other</label><input type=\"checkbox\" class=\"form-control-checkbox\" name=\"fieldoption_other\" ng-model=\"field.fieldoption_other\"></input><label>Read-only</label></div></div> <div ng-if=\"fields.dateformat\"><div fg-property-field=\"dateformat\" fg-property-field-label=\"Date Format\"><input type=\"text\" class=\"form-control\" name=\"dateformat\" ng-model=\"field.dateformat\"></div></div> <div ng-if=\"fields.allowedyears\"><div fg-property-field=\"allowedyears\" fg-property-field-label=\"Date Format\"><label>Current Year +</label><input type=\"text\" class=\"form-control\" name=\"allowedyears\" ng-model=\"field.allowedyears\"><label>years</label><label>Current Year -</label><input type=\"text\" class=\"form-control\" name=\"allowedyears\" ng-model=\"field.allowedyears\"><label>years</label></div></div> <div ng-if=\"fields.defaultvalue_date\"><div fg-property-field=\"defaultvalue_date\" fg-property-field-label=\"Default Value\"><input type=\"text\" class=\"form-control\" name=\"defaultvalue_date\" ng-model=\"field.defaultvalue_date\"><input type=\"checkbox\" class=\"form-control-checkbox\" name=\"defaultvalue_date\" ng-model=\"field.defaultvalue_date\"><label>Current Date</label></div></div> <div ng-if=\"fields.country_dropdown\"><div fg-property-field=\"country_dropdown\" fg-property-field-label=\"Country\"><select type=\"text\" class=\"form-control-select\" name=\"country_dropdown\" ng-model=\"field.country_dropdown\"> <option value=\"United States\" selected >United States</option><option value=\"germany\">Germany</option><option value=\"France\">France</option></select></div></div> <div ng-if=\"fields.format_dropdown \"><div fg-property-field=\"format_dropdown \" fg-property-field-label=\"Format\"><select type=\"text\" class=\"form-control-select\" name=\"format_dropdown \" ng-model=\"field.format_dropdown \"><option value=\"national\" selected >National</option><option value=\"international\">Inter National</option><option value=\"none\">None</option></select></div></div> <div ng-if=\"fields.minimalvalue\"><div fg-property-field=\"minimalvalue\" fg-property-field-label=\"Minimal Value\"><input type=\"text\" class=\"form-control\" name=\"minimalvalue\" ng-model=\"field.minimalvalue\"></div></div> <div ng-if=\"fields.maximalvalue\"><div fg-property-field=\"maximalvalue\" fg-property-field-label=\"Maximal Value\"><input type=\"text\" class=\"form-control\" name=\"maximalvalue\" ng-model=\"field.maximalvalue\"></div></div>  <div ng-if=\"fields.format_phonenumber \"><div fg-property-field=\"format_phonenumber \" fg-property-field-label=\"Format\"><select type=\"text\" class=\"form-control-select\" name=\"format_phonenumber \" ng-model=\"field.format_phonenumber \"><option value=\"0\" selected >0</option><option value=\"1\">1</option></select> <br><input type=\"checkbox\" class=\"form-control-checkbox\" name=\"format_phonenumber\" ng-model=\"field.format_phonenumber\"><label>Use Slider</label> <br> <label>Currency</label><select type=\"text\" class=\"form-control-select\" name=\"format_phonenumber \" ng-model=\"field.format_phonenumber \"><option value=\"USD\" selected >USD</option><option value=\"EUR\">EUR</option></select></div></div><div ng-if=\"fields.layout_option\"><div fg-property-field=\"layout_option\" fg-property-field-label=\"Layout Option\"><select type=\"text\" class=\"form-control-select\" name=\"layout_option \" ng-model=\"field.layout_option \"><option value=\"vertical\">vertical</option><option value=\"horizontal\">horizontal</option><select></div></div><div ng-if=\"fields.heading\"><div fg-property-field=\"heading\" fg-property-field-label=\"Heading\"><input type=\"text\" class=\"form-control\" name=\"heading\" ng-model=\"field.heading\"></div></div>  <div ng-if=\"fields.columns \"><div fg-property-field=\"columns \" fg-property-field-label=\"columns\"><select type=\"text\" class=\"form-control-select\" name=\"columns \" ng-model=\"field.columns \"><option value=\"1\" selected >1</option><option value=\"2\">2</option></select></div></div>  <div ng-if=\"fields.labelposition \"><div fg-property-field=\"labelposition \" fg-property-field-label=\"Label Position\"><select type=\"text\" class=\"form-control-select\" name=\"labelposition \" ng-model=\"field.labelposition \"><option value=\"label_pos_1\" selected >Label Position1</option><option value=\"label_pos_2\">Label Position2</option></select></div></div>  <div ng-if=\"fields.format_countryaddress\"><div fg-property-field=\"format_countryaddress\" fg-property-field-label=\"Format\"><input type=\"checkbox\" class=\"form-control-checkbox\" name=\"format_countryaddress\" ng-model=\"field.format_countryaddress\"><label>Current Date</label></div></div>  <div ng-if=\"fields.fieldoption_validate\"><div fg-property-field=\"fieldoption_validate\" fg-property-field-label=\"Field Option\"><input type=\"checkbox\" class=\"form-control-checkbox\" name=\"fieldoption_validate\" ng-model=\"field.required\"></input><label>Required</label><input type=\"checkbox\" class=\"form-control-checkbox\" name=\"fieldoption_validate\" ng-model=\"field.validate\"></input><label>Validate</label><input type=\"checkbox\" class=\"form-control-checkbox\" name=\"fieldoption_validate\" ng-model=\"field.readonly\"></input><label>Read-only</label></div></div> <div ng-if=\"fields.filetype\"><div fg-property-field=\"filetype\" fg-property-field-label=\"File Type\"><input type=\"text\" class=\"form-control\" name=\"filetype\" ng-model=\"field.filetype\"><br><span>.jpg, .jpeg, .gif, .png, .bmp, .tif, .psd, .pdf<span></div></div> <div ng-if=\"fields.listoption\"><div fg-property-field=\"checkoption\" fg-property-field-label=\"Option\"><div  fg-property-field-options=\"Options\"></div></div></div> <div ng-if=\"fields.checkoption\"><div fg-property-field=\"checkoption\" fg-property-field-label=\"Option\"><div fg-property-field-options=\"multiple\"></div></div></div> <div ng-if=\"fields.dropdownoption\"><div  fg-property-field=\"dropdownoption\" fg-property-field-label=\"Option\"><div fg-property-field-options=\"selectlist\"></div></div></div>');
 
  $templateCache.put('angular-form-gen/edit/canvas/field/properties/property-field/field-value.ng.html', '<div ng-if=\"draw\"><div fg-property-field=\"fieldValue\" fg-property-field-label=\"Initial value\"><div ng-transclude=\"\"></div></div></div>');
  $templateCache.put('angular-form-gen/edit/canvas/field/properties/property-field/property-field.ng.html', '<div class=\"form-group fg-property-field\" ng-class=\"{ \'has-error\': fieldPropertiesForm[fieldName].$invalid }\"><label class=\"col-sm-5 col-md-4 control-label\">{{ fieldLabel }}</label><div class=\"col-sm-7 col-md-8\"><div ng-transclude=\"\"></div><div fg-validation-summary=\"{{ fieldName }}\"></div></div></div>');
  $templateCache.put('angular-form-gen/edit/canvas/field/properties/validation/validation-message.ng.html', '<div ng-form=\"valMsgForm\"><div fg-property-field=\"message\" fg-property-field-label=\"Message\"><input type=\"text\" name=\"message\" title=\"{{ tooltip }}\" placeholder=\"Optional message\" ng-model=\"field.validation.messages[validationType]\" class=\"form-control\"></div></div>');
  $templateCache.put('angular-form-gen/edit/canvas/field/properties/validation/validation.ng.html', '<div ng-if=\"fields.minlength\" class=\"fg-property-field-validation\"><div fg-property-field=\"minlength\" fg-property-field-label=\"Minimum length\"><input type=\"text\" fg-field-redraw=\"\" fg-input-number=\"\" title=\"The minimum length of characters that should be entered.\" name=\"minlength\" ng-model=\"field.validation.minlength\" class=\"form-control\"></div><div ng-if=\"field.validation.minlength >= 1\"><div fg-edit-validation-message=\"minlength\"></div></div></div><div ng-if=\"fields.maxlength\" class=\"fg-property-field-validation\"><div fg-property-field=\"maxlength\" fg-property-field-label=\"Maximum length\"><input type=\"text\" fg-field-redraw=\"\" fg-input-number=\"\" title=\"The maximum length of characters that should be entered.\" name=\"maxlength\" ng-model=\"field.validation.maxlength\" class=\"form-control\"></div><div ng-if=\"field.validation.maxlength >= 1\"><div fg-edit-validation-message=\"maxlength\"></div></div></div><div ng-if=\"fields.pattern\" class=\"fg-property-field-validation\"><div fg-property-field=\"pattern\" fg-property-field-label=\"Pattern\"><div fg-dropdown-input=\"patternOptions\" name=\"pattern\" title=\"The pattern that should match with the input value.\" fg-parse-pattern=\"\" fg-field-redraw=\"\" ng-model=\"field.validation.pattern\"></div></div><div ng-if=\"field.validation.pattern.length > 0\"><div fg-edit-validation-message=\"pattern\"></div></div></div><div ng-if=\"fields.required\" class=\"fg-property-field-validation\"><div fg-property-field=\"required\"><div class=\"checkbox\"><label title=\"Indicates if a value is required for this field.\"><input type=\"checkbox\" ng-model=\"field.required\">Required</label></div></div><div ng-if=\"field.required\"><div fg-edit-validation-message=\"required\"></div></div></div>');
}]);
// drag and drop factory
angular.module('dq', []).factory('dqUtils', ["$window", "$rootScope", function($window, $rootScope) {

  var _dragData = null;

  //noinspection FunctionWithInconsistentReturnsJS
  return {
    getEvent: function (e) {
      return e && e.originalEvent ? e.originalEvent : e || $window.event;
    },
    stopEvent: function (e) {
      // e.cancelBubble is supported by IE8 -
      // this will kill the bubbling process.
      e.cancelBubble = true;
      e.bubbles = false;
      
      // e.stopPropagation works in modern browsers
      if (e.stopPropagation) e.stopPropagation();
      if (e.preventDefault) e.preventDefault();

      return false;
    },
    dragData: function (data) {
      if (data === undefined) {
        return _dragData;
      }
      _dragData = data;
    },
    getParentArea: function ($scope) {
      var area = {};
      $scope.$emit('dqLocateArea', area);
      return area.name;
    },
    isAreaMatch: function ($scope) {
      var parentArea = this.getParentArea($scope);
      var eventArea = _dragData ? _dragData.area : "";

      return parentArea === eventArea;
    }
  };
}]);
angular.module('dq').directive('dqDragArea', ["dqUtils", function (dqUtils) {

  function evalBroadcastEvent($scope, args, areaName, expression) {
    if (expression && args && args.area === areaName) {
      $scope.$eval(expression);
    }
  }

  return {
    restrict: 'AEC',
    link: function ($scope, $element, $attrs) {

      var areaName = $attrs.dqDragArea || $attrs.dqDragAreaName || "";

      $scope.$on('dqDragBegin', function ($event, args) {
        evalBroadcastEvent($scope, args, areaName, $attrs.dqDragProgressBegin);
      });

      $scope.$on('dqDragEnd', function ($event, args) {
        evalBroadcastEvent($scope, args, areaName, $attrs.dqDragProgressEnd);
      });

      $scope.$on('dqLocateArea', function($event, args) {
        args.name = areaName;
        $event.stopPropagation();
      });
    }
  }
}]);

angular.module('dq').directive('dqDragEnter',["dqDragTrack", function (dqDragTrack) {
  return {
    link: dqDragTrack
  };
}]).directive('dqDragLeave',["dqDragTrack", function (dqDragTrack) {
    return {
      link: dqDragTrack
    };
  }]).directive('dqDragOver',["dqDragTrack", function (dqDragTrack) {
    return {
      link: dqDragTrack
    };
  }]).directive('dqDrop',["dqDragTrack", function (dqDragTrack) {
    return {
      link: dqDragTrack
    };
  }]).factory('dqDragTrack', ["dqUtils", "$document", function (dqUtils, $document) {

    // Combines both nq-drag-enter & nq-drag-leave & nq-drag-over

    return function ($scope, $element, $attrs) {

      // Tracking already set on the element?

      if ($element.data('dqDragTrack') !== true) {

        var trackingEnabled = false; // Toggled on drag-begin if the area name does not match the target
        var inbound = false; // Toggle to indicate if the dragging is in or outbound element
        var element = $element[0];
        var dropEffect = 'none'; // Drop effect used in the dragover event
        var doingLeaveDoubleCheck = false; // Toggle that indicates the body has a dragover event to do.

        var $body = $document.find('body');

        function dragLeaveDoubleCheck($e) {
          var e = dqUtils.getEvent($e);

          // Check if the drag over element is a child of the this element

          var target = e.target || $e.target;

          if (target !== element) {

            // TODO: we're not really checking if the target element is visually within the $element.

            if (!element.contains(target)) {

              // Drag over element is out of bounds

              dragLeaveForSure(true);
            }
          }

          // We're done with the expensive body call

          $body.off('dragover', dragLeaveDoubleCheck);

          // Notify the local element event callback there's no event listener on the body and the next event
          // can safely be cancelled.

          doingLeaveDoubleCheck = false;

          e.dataTransfer.dropEffect = dropEffect;

          // Always cancel the dragover -- otherwise the dropEffect is not used.

          return dqUtils.stopEvent($e);
        }

        function dragLeaveForSure(apply) {
          inbound = false;
          var expression = $attrs.dqDragLeave;
          if (expression) {
            if (apply) {
              $scope.$apply(function () {
                $scope.$eval(expression);
              });
            } else {
              $scope.$eval(expression);
            }
          }
        }

        $scope.$on('$destroy', function () {
          // Just to be sure
          $body.off('dragover', dragLeaveDoubleCheck);
        });

        $scope.$on('dqDragBegin', function () {
          // Check if we should track drag movements
          trackingEnabled = dqUtils.isAreaMatch($scope);
        });

        $scope.$on('dqDragEnd', function () {
          if (trackingEnabled) {
            // Gief cake
            dragLeaveForSure(false);
          }
        });

        $element.on('dragenter', function (e) {
          if (trackingEnabled && inbound === false) {
            inbound = true;
            var expression = $attrs.dqDragEnter;
            if (expression) {
              $scope.$apply(function () {
                $scope.$eval(expression);
              });
            }
          }
        });

        $element.on('dragleave', function () {
          if (trackingEnabled && inbound === true) {

            // dragleave is a lie -- hovering child elements will cause this event to trigger also.
            // We fake the cake by tracking the drag ourself.

            // Notify the "real" dragover event that he has to play nice with the body and not to
            // cancel the event chain.

            doingLeaveDoubleCheck = true;
            $body.on('dragover', dragLeaveDoubleCheck);
          }
        });

        //noinspection FunctionWithInconsistentReturnsJS
        $element.on('dragover', function ($e) {

          if (trackingEnabled) {

            var e = dqUtils.getEvent($e);

            var expression = $attrs.dqDragOver;
            var result;

            if (expression) {
              $scope.$apply(function () {
                result = $scope.$eval(expression);
              });
            }

            // The evaluated expression can indicate to cancel the drop

            dropEffect = result === false ? 'none' : 'copy';

            if (!doingLeaveDoubleCheck) {

              // There's no dragover queued on the body.
              // The event needs to be terminated here else the dropEffect will
              // not be applied (and dropping is not allowed).

              e.dataTransfer.dropEffect = dropEffect;
              return dqUtils.stopEvent($e);
            }
          }
        });

        //noinspection FunctionWithInconsistentReturnsJS
        $element.on('drop', function($e) {
          var e = dqUtils.getEvent($e);

          if(trackingEnabled) {
            var expression = $attrs.dqDrop;

            if(expression) {
              $scope.$apply(expression);
            }
          }

          return dqUtils.stopEvent($e);
        });

        // Ensure that we only do all this magic stuff on this element for one time only.

        $element.data('dqDragTrack', true);
      }
    };

  }]);

angular.module('dq').directive('dqDraggable', ["dqUtils", "$rootScope", function (dqUtils, $rootScope) {

  function evalAndBroadcast(eventName, targetArea, $scope, expression, cb) {
    $scope.$apply(function () {
      var data = $scope.$eval(expression);

      var bcData = {
        area: targetArea,
        data: data
      };

      cb(bcData);

      $rootScope.$broadcast(eventName, bcData);
    });
  }

  return {
    restrict: 'AEC',
    link: function ($scope, $element, $attrs) {

      var targetArea = $attrs.dqDraggable || $attrs.dqDragTargetArea || "";
      var disabled = false;

      $scope.$watch($attrs.dqDragDisabled, function(value) {
        disabled = value;
        $element.attr('draggable', disabled ? 'false' : 'true');
      });

      $element.on('selectstart',function (e) {

        // Pure IE evilness

        if (!disabled && this.dragDrop) {
          this.dragDrop();
          e = dqUtils.getEvent(e);
          return dqUtils.stopEvent(e);
        }
      }).on('dragstart',function (e) {

          e = dqUtils.getEvent(e);

          if(disabled) {
            return dqUtils.stopEvent(e);
          }

          var dt = e.dataTransfer;
          dt.effectAllowed = 'all';
          dt.setData('Text', 'The cake is a lie!');

          evalAndBroadcast('dqDragBegin', targetArea, $scope, $attrs.dqDragBegin, function(dragData) {
            dqUtils.dragData(dragData);
          });

        }).on('dragend', function () {

          evalAndBroadcast('dqDragEnd', targetArea, $scope, $attrs.dqDragEnd, function() {
            dqUtils.dragData(null);
          });

        });
    }
  };

}]);
fg.directive('fgBindExpression', ["$interpolate", function ($interpolate) {

  function buildWatchExpression(interpolateFn) {
    var sb = [];
    var parts = interpolateFn.parts;
    var ii = parts.length;

    while (ii--) {
      var part = parts[ii];

      if (part.exp && !part.exp.match(/^\s*$/)) {
        sb.push(part.exp);
      }
    }

    return '[' + sb.join() + ']';
  }

  return function (scope, element, attr) {

    var interpolateFn, watchHandle, oldWatchExpr;

    function cleanWatchHandle() {
      if (watchHandle) watchHandle();
      watchHandle = undefined;
    }

    function interpolateExpression() {
      element.text(interpolateFn(scope));
    }

    scope.$on('$destroy', function () {
      cleanWatchHandle();
    });

    scope.$watch(attr.fgBindExpression, function (value) {
      if (value !== undefined) {
        interpolateFn = $interpolate(value);

        element.addClass('ng-binding').data('$binding', interpolateFn);

        var watchExpr = buildWatchExpression(interpolateFn);

        if (oldWatchExpr !== watchExpr) {

          oldWatchExpr = watchExpr;

          cleanWatchHandle();

          watchHandle = scope.$watchCollection(watchExpr, function () {
            interpolateExpression();
          });
        } else {
          interpolateExpression();
        }
      }
    });
  };
}]);

fg.directive('fgDropdownInput', ["$compile", "$document", "$timeout", "$parse", "fgUtils", function ($compile, $document, $timeout, $parse, fgUtils) {

  function createInput($scope, $element, $attrs) {

    var template = '<div class="fg-dropdown-input input-group">' +
      '<input type="text" class="form-control"/>' +
      '<span class="input-group-btn">' +
      '<button class="btn btn-default" type="button" ng-click="dropdownToggle()">' +
      '<span class="caret"></span>' +
      '</button>' +
      '</span>' +
      '</div>';

    var $template = angular.element(template);
    var $input = $template.find('input');

    // Copy the original attributes to the input element

    var attributes = $element.prop("attributes");

    angular.forEach(attributes, function (a) {
      if (a.name !== 'fg-dropdown-input' && a.name !== 'class') {
        $input.attr(a.name, a.value);
      }
    });

    var $button = $template.find('button');
    var closeTimeout;

    $scope.dropdownToggle = function () {
//      $button[0].focus(); // force focus for chrome
      $scope.dropdownVisible = !$scope.dropdownVisible;
    };

//    $button.on('blur', function () {
//      closeTimeout = $timeout(function () {
//        $scope.dropdownVisible = false;
//      }, 100);
//    });

    $scope.$on('$destroy', function () {
      if (closeTimeout) $timeout.cancel(closeTimeout);
      closeTimeout = undefined;
    });

    return $template;
  }

  function createDropdown($scope, $element, $attrs, ngModelCtrl, $input) {

    var modelGetter = $parse($attrs.ngModel);
    var modelSetter = modelGetter.assign;

    var template = '<div class="fg-dropdown" ng-class="{ \'open\': dropdownVisible }">' +
      '<ul ng-if="items && items.length" class="dropdown-menu">' +
      '<li ng-repeat="item in items" ng-class="{ active: item.value === getModelValue() }">' +
      '<a href="" ng-click="setModelValue(item.text)">{{ item.text || item.value }}</a>' +
      '</li>' +
      '</ul>' +
      '</div>';

    var $template = angular.element(template);

    $scope.setModelValue = function (value) {

      $scope.dropdownVisible = false;

      // Convert to a string

      var viewValue = value || '';

      var idx = ngModelCtrl.$formatters.length;

      while (idx--) {
        var fn = ngModelCtrl.$formatters[idx];
        var viewValue = fn(viewValue);

        if (viewValue === undefined) {
          break;
        }
      }


      // Parse the viewValue

      idx = ngModelCtrl.$parsers.length;
      var pv = viewValue;

      while (idx--) {
        var fn = ngModelCtrl.$parsers[idx];
        pv = fn(pv);

        if (pv === undefined) {
          break;
        }
      }

      if (pv === undefined) {
        // Failed to parse.
        // Set the formatted string in the input, which will retrigger the parsing and display the correct error message.

        ngModelCtrl.$setViewValue(viewValue);
        ngModelCtrl.$render();

      } else {
        modelSetter($scope, value);
      }
    };

    $scope.getModelValue = function () {
      return modelGetter($scope);
    };

    var input = $input[0];

    $scope.$watch('dropdownVisible', function (value) {
      if (value) {

        var rect = input.getBoundingClientRect();
        var scroll = fgUtils.getScrollOffset();

        $template.css({
          left: (scroll.x + rect.left) + 'px',
          top: (scroll.y + rect.top + input.clientHeight) + 'px',
          width: input.clientWidth + 'px'
        });
      }
    });

    $scope.$watchCollection($attrs.fgDropdownInput, function (value) {
      $scope.items = value;
    });

    $scope.$on('$destroy', function () {
      $template.remove();
    });

    return $template;
  }

  return {
    priority: 1000,
    restrict: 'A',
    terminal: true,
    scope: true,
    compile: function (tElement, tAttrs) {

      return function link($scope, $element, $attrs, ctrls) {

        var $input = createInput($scope, $element, $attrs);

        $element.append($input);
        $compile($input)($scope);

        var $inputText = $input.find('input');
        var ngModelCtrl = $inputText.controller('ngModel');

        ////////////////////////////////////////

        var $dropdown = createDropdown($scope, $element, $attrs, ngModelCtrl, $input);
        var dropdownCompileFn = $compile($dropdown);

        var $body = $document.find('body');

        $body.append($dropdown);

        dropdownCompileFn($scope);

        ////////////////////////////////////////
      };
    }
  };
}]);

/**
 * Created by null on 16/10/14.
 */
fg.directive('fgNullForm', function () {

  var nullFormCtrl = {
    $addControl: angular.noop,
    $removeControl: angular.noop,
    $setValidity: angular.noop,
    $setDirty: angular.noop,
    $setPristine: angular.noop
  };

  return {
    restrict: 'A',
    require: ['form'],
    link: function link($scope, $element, $attrs, $ctrls) {

      var form = $ctrls[0];

      // Locate the parent form

      var parentForm = $element.parent().inheritedData('$formController');

      if(parentForm) {

        // Unregister this form controller

        parentForm.$removeControl(form);
      }

      // Nullify the form

      angular.extend(form, nullFormCtrl);
    }
  };
});

fg.directive('fgFormRequiredFilter', function() {

  return {
    restrict: 'A',
    require: ['form'],
    link: function($scope, $element, $attrs, $ctrls) {

      var form = $ctrls[0];

      var $setValidity = form.$setValidity;

      form.$setValidity = function (validationToken, isValid, control) {

        if(validationToken === 'required') {
          isValid = true;
        }

        $setValidity.call(form, validationToken, isValid, control);
      };
    }
  };

});
fg.directive('fgInputNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attr, ctrl) {
      
      ctrl.$parsers.push(function(inputValue) {
        // this next if is necessary for when using ng-required on your input. 
        // In such cases, when a letter is typed first, this parser will be called
        // again, and the 2nd time, the value will be undefined
        if (inputValue == undefined) {
          return '';
        }

        var transformedInput = inputValue.replace(/[^0-9]/g, '');

        var value = parseInt(transformedInput);
        value === NaN ? undefined : value;

        if (transformedInput != inputValue) {
          ctrl.$setViewValue(transformedInput);
          ctrl.$render();
        }

        return value;

      });

      ctrl.$parsers.push(function(value) {
        var empty = ctrl.$isEmpty(value);
        if (empty || /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/.test(value)) {
          ctrl.$setValidity('number', true);
          return value === '' ? null : (empty ? value : parseFloat(value));
        } else {
          ctrl.$setValidity('number', false);
          return undefined;
        }
      });

      ctrl.$formatters.push(function(value) {
        return ctrl.$isEmpty(value) ? undefined : value;
      });

      if (attr.min) {
        var minValidator = function(value) {
          var min = parseFloat(attr.min);
          if (!ctrl.$isEmpty(value) && value < min) {
            ctrl.$setValidity('min', false);
            return undefined;
          } else {
            ctrl.$setValidity('min', true);
            return value;
          }
        };

        ctrl.$parsers.push(minValidator);
        ctrl.$formatters.push(minValidator);
      }

      if (attr.max) {
        var maxValidator = function(value) {
          var max = parseFloat(attr.max);
          if (!ctrl.$isEmpty(value) && value > max) {
            ctrl.$setValidity('max', false);
            return undefined;
          } else {
            ctrl.$setValidity('max', true);
            return value;
          }
        };

        ctrl.$parsers.push(maxValidator);
        ctrl.$formatters.push(maxValidator);
      }

      ctrl.$formatters.push(function(value) {

        if (ctrl.$isEmpty(value) || angular.isNumber(value)) {
          ctrl.$setValidity('number', true);
          return value;
        } else {
          ctrl.$setValidity('number', false);
          return undefined;
        }
      });
    }
  };
});

fg.directive('fgPlaceholder', function() {
  /*
    This attribute is only required on TEXTAREA elements. 
    Angular in combination with IE doesn't like placeholder="{{ myExpression }}".
   */
  return { 
    link: function($scope, $element, $attrs) {
      $scope.$watch($attrs.fgPlaceholder, function(value) {
        $element.attr('placeholder', value);
		 //$element.attr('Supportingtext', value);
      });
    }
  };
});
fg.factory('fgUtils', ["$templateCache", "$window", "fgConfig", function ($templateCache, $window, fgConfig) {

    var uniqueCounter = (+new Date) % 10000;

    return {
      getScrollOffset: function() {

        // the pageYOffset property of the window object is supported in all browsers except 
        // in Internet Explorer before version 9, and always returns the scroll amount regardless of the doctype
        
        // the scrollY property of the window object is supported by Firefox, Google Chrome and Safari, and always
        // returns the scroll amount regardless of the doctype
        
        // if a doctype is specified in the document, the scrollTop property of the html element returns the scroll
        // amount in Internet Explorer, Firefox and Opera, but always returns zero in Google Chrome and Safari
        
        // if no doctype is specified in the document, the scrollTop property of the html element always returns zero

        // if no doctype is specified in the document, the scrollTop property of the body element returns the 
        // scroll amount in Internet Explorer, Firefox, Opera, Google Chrome and Safari.

        var offset = {};

        if($window.pageYOffset !== undefined) {
          offset.x = $window.pageXOffset;
          offset.y = $window.pageYOffset;
        } else {
          var de = $window.document.documentElement;
          offset.x = de.scrollLeft;
          offset.y = de.scrollTop;
        }

        return offset;
      },
      defaultArea: 'default',
      getRenderInfo: function(field) {
        //var renderInfo = fg.Field[field.type];
        var renderInfo = fgConfig.fields.renderInfo[field.type];

        if(!renderInfo) {
          renderInfo = {};
          // fg.Field[field.type] = renderInfo;
          fgConfig.fields.renderInfo[field.type] = renderInfo;
        }

        if(!renderInfo.templateUrl) {
		//debugger
          renderInfo.templateUrl = this.getTemplateUrl(field);
        }

        if(!renderInfo.propertiesTemplateUrl) {
          renderInfo.propertiesTemplateUrl = this.getTemplateUrl(field, 'properties');
        }

        return renderInfo;
      },
      formatTemplateUrl: function (type, area) {
        return 'angular-form-gen/field-templates/' + (area || this.defaultArea) + '/' + type + '.ng.html';
      },
      getTemplateUrl: function (field, area) {
		//debugger
        area = area || this.defaultArea;

        // IE8 fix: Aliases removed
        // var templateType = fgConfig.fields.aliases[field.type] || field.type;
        var templateType = field.type;
        var templateUrl = this.formatTemplateUrl(templateType, area);

        var cached = $templateCache.get(templateUrl);

        if (!cached) {

          // Url is not in cache -- fallback to default area.
          // Properties area will never fallback to default area.

          if (area !== 'properties' && area !== this.defaultArea) {
            templateUrl = this.getTemplateUrl(field, this.defaultArea);
          } else {
            return this.formatTemplateUrl('not-in-cache');
          }
        }

        return templateUrl;
      },
      getUnique: function() {
        return ++uniqueCounter;
      },
      copyField: function(field) {
        var copy = angular.copy(field);
        var uniqueField= this.getUnique()
        copy.name = 'field' + uniqueField;
		var keyproperty=Object.keys(copy);
			if(keyproperty[3]== "address"){
				copy.address.valueAddname='Name'+ uniqueField
				copy.address.valueStreet='Street'+ uniqueField
				copy.address.valueCity='City'+ uniqueField
				copy.address.valueState='State'+ uniqueField
				copy.address.valueZip='Zip'+ uniqueField
			}
        return copy;
      },
      findElementsByClass: function (root, className, recursive, buffer) {
        buffer = buffer || [];

        if (root.className === className) {
          buffer.push(root);
        }

        if (root.hasChildNodes()) {
          for (var i = 0; i < root.children.length; i++) {
            var child = root.children[i];
            if (child.className === className) {
              buffer.push(child);
            }
            if (recursive) {
              this.findElementsByClass(child, className, recursive, buffer);
            }
          }
        }

        return buffer;
      }
    };
  }]);
fg.controller('fgEditController', ["$scope", "fgUtils", "$location", function ($scope, fgUtils, $location) {
$scope.value= {};
$scope.value.showField=true;
$scope.themeglypicon ={};
	$scope.themeglypicon.themeglyp="plus"
$scope.themeClick= function(){
		$scope.value.showField=false;
		$scope.value.showTheme=true;
		$scope.value.showcreateTheme=false;
	}
	$scope.fieldClick= function(){
		$scope.value.showField=true;
		$scope.value.showTheme=false;
		$scope.value.showcreateTheme=false;
	}
	$scope.createthemeClick=function(){
		$scope.value.showTheme=false;
		$scope.value.showField=false;
		$scope.value.showcreateTheme=true;
	}
	
	$scope.object={
		quickstyles:{
			angular_variable:'',
			fontfamily:'"Helvetica Neue",Helvetica,Arial,sans-serif',
			slider_toggle : {
				value: 14,
				options: {
					floor: 14,
					ceil: 25,
					step: 1,
					precision: 1
				}
			},
			slider_toggle_space : {
				value: 5,
				options: {
					floor: 5,
					ceil: 25,
					step: 1,
					precision: 1
				}
			},
			styles:0
			
		},
    advanceStyles:{
      general:{
        formBackground:'',
        formBorder:0
      },
      formFields:{
        fieldLabelText:'',
        fieldBackground:'',
        fieldBorder:'',
        roundCorners:0,
        labelPosition:'left',
        supportingText:""
      },
      buttonFields:{
        
        
      },
      advanceFields:{
        
        
      },
      section:{
        
        
      },
      additionalComponents:{
        
      }
      
    },
    themeDetails:{
      
      
    }
		
			
	} 
	
	console.log(JSON.stringify($scope.object))
	
	

//  var self = this;

//  $scope.preview = $location.search().preview;
//
//  this.setMetaForm = function(metaForm) {
//    self.metaForm = metaForm;
//  };

//  this.togglePreview = function() {
//    $scope.preview = !$scope.preview;
//  };

//  $scope.$watch(function () {
//
//    var schema = $scope.schemaCtrl.model();
//
//    // Seems that this watch is sometimes fired after the scope has been destroyed(?)
//
//    if (schema) {
////      schema.$_invalid = self.metaForm ? self.metaForm.$invalid : false;
////
////      if (!schema.$_invalid) {
//
//      var fields = schema.fields;
//
//      if (fields) {
//
//        var i = fields.length;
//
//        while (--i >= 0 && !schema.$_invalid) {
//          schema.$_invalid = fields[i].$_invalid;
//        }
//      }
//    }
//
//  });



}]);
fg.directive('mediaPreview', function($log, $document) {

  var directive = {
    restrict: 'A',
    require: 'ngModel',
    link: _link
  }

  return directive;

  function _link(scope, elem, attrs, ngModel) {
	console.log(attrs);
    // check if valid input element
    if( elem[0].nodeName.toLowerCase() !== 'input' ) {
      $log.warn('mediaPreview:', 'The directive will work only for input element, actual element is a', elem[0].nodeName.toLowerCase());
      return;
    }

    // check if valid input type file
    if( attrs.type != 'file' ) {
      $log.warn('mediaPreview:', 'Expected input type file, received instead:', attrs.type, 'on element:', elem);
      return;
    }

    // set all media type if nothing is specified
    if( !elem.attr('accept') ) {
      elem.attr('accept', 'image/*,video/*,audio/*');
    }

    // the preview container
    var container;

    var fallbackImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAA00lEQVR4Ae2XwQqDQAxEveinFD9e2MUfq6Cep7GnrPAg1JVCu5OTvEwe9FLtWlpqR6OyVn2aXbNGdX6KB4OLrmbRyIKsGsksWKsINhbUShM0wVcEk43CnAVY722mMEfBhPWD9mGOAlvBepSDwK1gPc5LASp8fbCJ81KACl9PNkOYo8CfKOtHUpijwJ841y1xToJy5VxXnLPgvUL1OAeBW4F6kKPAnYB6jKPAnYA68PZ/8EOCJtjvfvmdqwjSvR8gTz1YcCiytgs/TvLnvaDi/J2gCV63ZgZdEb12DwAAAABJRU5ErkJggg==";

    // get custom class or set default
    var previewClass = attrs.previewClass || 'media-preview';

    // get custom class or set default
    var containerClass = attrs.containerClass || 'media-container';

    // as default if nothing is specified or
    // the element specified is not a valid html
    // element: create the default media container
    // and append before input element
    if( !attrs.previewContainer || ( !document.getElementById(attrs.previewContainer) && !angular.isElement(attrs.previewContainer) ) ) {

      // create container
      container = angular.element( document.createElement('div') );

      // append before elem
      elem.parent()[0].insertBefore(container[0], elem[0]);

    } else {

      // get the container
      container = angular.isElement(attrs.previewContainer) ? attrs.previewContainer : angular.element(document.getElementById(attrs.previewContainer));
    }

    // add default class
    container.addClass(containerClass);

    // add element to the container
    function addToContainer(element) {
      element.addClass(previewClass);
      return container.append( element );
    }

    // the change function
    function onChange(e) {

      // get files
      var files = elem[0].files;

      // update model value
      attrs.multiple ? ngModel.$setViewValue(files) : ngModel.$setViewValue(files[0]);

      // reset container
      container.empty();

      // check if there are files to read
      if( files && files.length ) {
debugger
        // start the load process for each file
        angular.forEach(files, function(data, index) {

          // init variables
          var $reader = new FileReader(), $mediaElement;
		scope.result='';
          // set fallback image on error
          $reader.onloaderror = function (e) {
            scope.result = fallbackImage;
          }

          // set resulting image
          $reader.onload = function (e) {
            scope.result = e.target.result;
          }

          // when file reader has finished
          // add the source to element and append it
          $reader.onloadend = function(e) {

            // if audio
            if( scope.result.indexOf('data:audio') > -1 ) {

              $mediaElement = angular.element( document.createElement('audio') );
              $mediaElement.attr('controls', 'true');

            } else if( scope.result.indexOf('data:video') > -1 ) {

              $mediaElement = angular.element( document.createElement('video') );
              $mediaElement.attr('controls', 'true');

            } else {

              $mediaElement = angular.element( document.createElement('img') );
				//console.log(scope.$parent.form.schema);
				$('#image'+attrs.myid).attr('src',''+scope.result);
            }
			var index = attrs.myid;
			
			for(var i=0;i<scope.$parent.form.schema.length;i++){
				for(var j=0;j<scope.$parent.form.schema[i].fields.length;j++){
					if(scope.$parent.form.schema[i].fields[j].name==attrs.myid){
						scope.$parent.form.schema[i].fields[j].filepath=scope.result;
						scope.$apply();
					}
				}
			}
			//scope.$parent.form.schema[index[0]][[index[1]][path]=scope.result;
            // add the source
            //$mediaElement.attr('src', scope.result);
           // $mediaElement.attr('filepath=\"{{ field.schema.supportingtext }}\"', result);

            // finally add to the container
            return addToContainer( $mediaElement );
          }

          // read file
          $reader.readAsDataURL( data );
        })

      }

    }

    // bind change event
    elem.on('change', onChange)

    // unbind event listener to prevent memory leaks
    scope.$on('$destroy', function () {
      elem.off('change', onChange);
    })

  }

});

fg.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);

fg.directive('parseStyle', function($interpolate) {
    return function(scope, elem) {
        var exp = $interpolate(elem.html()),
            watchFunc = function () { return exp(scope); };
        console.log("innerCheck1")
		
        scope.$watch(watchFunc, function (html) {
            elem.html(html);
		console.log("element:"+elem.html())
        });
    };
}); 
fg.directive('fgEdit', function () {
  return {
    priority: 100,
    require: 'fgSchema',
    restrict: 'AE',
    scope: {
      // // The schema model to edit
      schema: '=?fgSchema',
	  extracts:'='
//      // Boolean indicating wether to show the default form action buttons
//      actionsEnabled: '=?fgActionsEnabled',
//      // Callback function when the user presses save -- any argument named 'schema' is set to the schema model.
//      onSave: '&fgOnSave',
//      // Callback function when the user presses cancel -- any argument named 'schema' is set to the schema model.
//      onCancel: '&fgOnCancel',
//      // Boolean indicating wether the edit is in preview mode or not
//      preview: '=?fgPreview'
    },
    replace: true,
    controller: 'fgEditController as editCtrl',
    templateUrl: 'angular-form-gen/edit/edit.ng.html',
    link: function ($scope, $element, $attrs, schemaCtrl) {
		/* $scope.formExtracts = {};
		$scope.formExtracts.reCaptcha = true; */
		console.log('s', $scope);
      if ($scope.schema === undefined) {
        $scope.schema = {};
      }

     if ($scope.actionsEnabled === undefined) {
        $scope.actionsEnabled = true;
     }
//
//      if ($scope.preview === undefined) {
//        $scope.preview = false;
//      }

      $scope.manualClick=function(){

        console.log("innnnn")
      }

      schemaCtrl.model($scope.schema);
      $scope.schemaCtrl = schemaCtrl;
    }
  }
});
fg.controller('fgFormController', ["$scope", "$parse", function($scope, $parse) {
	$scope.submitForm = function(){
		console.log('ss', $scope);
	}
	console.log('sss', $scope.extracts);
	
		
  this.model = {};
  var self = this;
  this.init = function(dataExpression, schema, state, editMode) {
  
    // Called by the directive

    self.editMode = editMode;

    var dataGetter = $parse(dataExpression);
    var dataSetter = dataGetter.assign;

    $scope.$watch(dataGetter, function(value) {
      if(value === undefined) {
        value = {};

        if(dataSetter) {
          dataSetter($scope, value);
        }
      }

      self.model.data = value;
    });

    $scope.$watch(function() {
      return schema.model();
    }, function(value) {
      if(value === undefined) {
        schema.model({});
      } else {
        self.model.schema = value;
      }
    });

    self.model.state = state;

    
    return self.model;
  };

//  this.clearFocusOnFields = function() {
//    angular.forEach(self.model.schema.fields, function(field) {
//      field.focus = false;
//    });
//  };

}]);

fg.directive('fgForm', ["fgFormCompileFn", function(fgFormCompileFn) {
  return {
    restrict: 'AE',
    require: ['^?form', 'fgForm', '^fgSchema'],
    controller: 'fgFormController',
    scope: true,
    compile: fgFormCompileFn
  };
}]).factory('fgFormLinkFn', function() {
    return function link($scope, $element, $attrs, ctrls) {

      var ngFormCtrl = ctrls[0];
      var formCtrl = ctrls[1];
      var schemaCtrl = ctrls[2];

      var editMode = $attrs.fgNoRender === 'true';

      formCtrl.init($attrs.fgFormData, schemaCtrl, ngFormCtrl, editMode);
      
    };
}).factory('fgFormCompileFn', ["fgFormLinkFn", function(fgFormLinkFn) {
  return function($element, $attrs) {

    $element.addClass('fg-form');

    var noRender = $attrs.fgNoRender;
    
    if (noRender !== 'true') {
      var renderTemplate = '<div  fg-form-fields extracts="myForm.extracts"></div>';
      $element.append(renderTemplate);
    }
    
    return fgFormLinkFn;
  };
}]);


fg.directive('fgValidationSummary', ["fgValidationSummaryLinkFn", function(fgValidationSummaryLinkFn) {

  return {
    require: ['^?fgField', '^?form'],
    templateUrl: 'angular-form-gen/validation/summary.ng.html',
    scope: {
      fieldName: '@?fgValidationSummary',
      validationMessages: '=?fgValidationMessages'
    },
    link: fgValidationSummaryLinkFn
  };
}]).factory('fgValidationSummaryLinkFn', ["fgConfig", function(fgConfig) {

  return function($scope, $element, $attrs, ctrls) {

    var fgFieldCtrl = ctrls[0];
    var ngFormController = ctrls[1];

    if (fgFieldCtrl) {
      // Grab the whole field state from the field controller
      $scope.field = fgFieldCtrl.field();
      $scope.form = fgFieldCtrl.form();

    } else if (ngFormController) {
      
      $scope.form = {
        state: ngFormController
      };

      $scope.$watch('fieldName', function(value) {
        $scope.field = {
          name: value,
          state: ngFormController[value]
        };
      });
    }

    // Whenever the form designer edits a custom message but decides to delete it later a "" is leftover.
    // I don't feel like setting all kinds of watchers so we'll fix that here

    if($scope.validationMessages) {
      angular.forEach($scope.validationMessages, function(value, key) {
        if(!value) {
          delete $scope.validationMessages[key];
        }
      });
    }

    $scope.messages = angular.extend({}, fgConfig.validation.messages, $scope.validationMessages);
  };

}]);
fg.directive('fgUniqueFieldName', function () {

  var changeTick = 0;

  function validate(ngModelCtrl, schemaCtrl, field) {
    
    var schema = schemaCtrl.model();
    var valid = true;
    var schemaField;

    if(schema) {

      var fields = schema.fields;

      for (var i = 0; i < fields.length; i++) {
        schemaField = fields[i];
        if (schemaField !== field && field.name === schemaField.name) {
          valid = false;
          break;
        }
      }
    }

    ngModelCtrl.$setValidity('unique', valid);
  }

  return {
    priority: 100,
    require: ['ngModel', '^fgSchema'],
    link: function ($scope, $element, $attrs, ctrls) {

      var ngModelCtrl = ctrls[0];
      var schemaCtrl = ctrls[1];
      
      var field = $scope.field;

      if(!field) {
        throw Error('No field property on scope');
      }

      $scope.$watch(function() { return ngModelCtrl.$modelValue; }, function () {
        
        // Every instance of this directive will increment changeTick
        // whenever the name of the associated field is modified.

        ++changeTick;
      });

      $scope.$watch(function() { return changeTick; }, function() {

        // Every instance of this directive will fire off the validation
        // whenever the changeTick has been modifed.

        validate(ngModelCtrl, schemaCtrl, field);
      });
    }
  };
});

fg.filter('j$on',function () {
  return function (input, displayHidden) {

    if(displayHidden)
      return JSON.stringify(input || {}, null, '  ');

    return angular.toJson(input || {}, true);
  };
}).directive('jsonify', ["$window", "$filter", function ($window, $filter) {
    return {
      templateUrl: 'angular-form-gen/common/jsonify/jsonify.ng.html',
      replace: true,
      scope: {
        jsonify: "=",
        displayHidden: "@jsonifyDisplayHidden"
      },
      link: function($scope, $element, $attrs, ctrls) {
        $scope.expression = $attrs.jsonify;

        $scope.copy = function() {
          $window.prompt ("Copy to clipboard: Ctrl+C, Enter", $filter('j$on')($scope.jsonify, $scope.displayHidden));
        };
      }
    };
  }]);

fg.controller('fgTabsController', ["$scope", function ($scope) {

	$scope.submitForm = function(){
		console.log($scope.$parent.myForm);
	};

  this.items = [];
  this.active = null;
  this.activeIndex = -1;
  
  this.add = function (item) {
    this.items.push(item);

    this.items.sort(function (x, y) {
      return x.order - y.order;
    });

    if (!$scope.active && item.autoActive != false) {
      this.activate(item);
    }
  };

  this.activate = function (itemOrIndex) {

    var idx = -1, item;
    
    if (isNaN(itemOrIndex)) {
      
      // Locate the item index
      
      item = itemOrIndex;
      var i = this.items.length;

      while (i--) {
        if (this.items[i] === item) {
          idx = i;
          break;
        }
      }

      if (idx === -1) {
        throw new Error('Cannot activate pane: not found in pane list.');
      }
    } else {
      
      // Grab the item at the provided index
      
      idx = itemOrIndex;
      
      if(idx < 0 || idx >= this.items.length) {
        throw new Error('Cannot activate pane: index out of bounds.')
      }
      
      item = this.items[idx];
    }

    if (!item.disabled) {
      this.active = $scope.active = item;
      this.activeIndex = $scope.activeIndex = idx;
    }

  };

}]);
fg.directive('fgTabs', function() {
  return {
    require: ['fgTabs'],
    restrict: 'EA',
    transclude: true,
    controller: 'fgTabsController',
    templateUrl: 'angular-form-gen/common/tabs/tabs.ng.html',
    scope: {
      'tabs': '=?fgTabs',
      'active': '=?fgTabsActive',
      'activeIndex': '=?fgTabsActiveIndex'
    },
    link: function($scope, $element, $attrs, $ctrls) {
      $scope.tabs = $ctrls[0];
      //$scope.countcheckPreview=1;
      $scope.$watch('activeIndex', function(value) {
        if(value !== undefined && $scope.tabs.activeIndex !== value) {
          $scope.tabs.activate(value);
        }
		console.log($scope)
		//
		/* if($scope.tabs.active.title=="Form Preview"){
			console.log($scope)
			
		} */
		console.log($scope.countcheckPreview)
		
			$('.fgpreviewElem').hide();
		$('#fgEditPreviewId_0').css('display','block')
		
		
		//$('#pagePreviewIndex_0').css('display','block')
      });
    }
  };
});




fg.directive('fgTabsPane', ["fgTabsPaneLinkFn", function(fgTabsPaneLinkFn) {
  return {
    require: ['^fgTabs'],
    restrict: 'EA',
    transclude: true,
    templateUrl: 'angular-form-gen/common/tabs/tabs-pane.ng.html',
    link: fgTabsPaneLinkFn,
    scope: true
  };
}]).factory('fgTabsPaneLinkFn', function() {
  return function($scope, $element, $attrs, $ctrls) {

    $scope.tabs = $ctrls[0];

    $scope.pane = {
      title: $attrs.fgTabsPane || $attrs.title,
      order: parseInt($attrs.fgTabsPaneOrder || $attrs.order) || 10,
      autoActive: !($attrs.fgTabsPaneAutoActive === "false" || $attrs.autoActive === "false"),
      renderAlways: $attrs.fgTabsPaneRenderAlways === "true" || $attrs.renderAlways === "true"
    };
	console.log($scope)
    $scope.$watch($attrs.fgTabsPaneDisabled, function(value) {
      $scope.pane.disabled = value;
    });

    $scope.tabs.add($scope.pane);
	//console.log($scope)
  };
});

fg.controller('fgEditCanvasController', ["$scope", "dqUtils", "$timeout", "fgUtils", function ($scope, dqUtils, $timeout, fgUtils) {

  $scope.dragPlaceholder = {
    visible: false,
    index: 0
  };

  // - - - 8-< - - - - - - - - - - - - - - - - - - - - -
  // Drag & drop
  // - - - 8-< - - - - - - - - - - - - - - - - - - - - -

  $scope.$on('dqDragBegin', function() {
    $scope.dragging = true;
  });

  $scope.$on('dqDragEnd', function() {
    $scope.dragging = false;
  });

  this.dragEnter = function () {
//    $scope.dragging = true;
    $scope.dragPlaceholder.visible = true;
    $scope.dragPlaceholder.index = $scope.schema[pageCount].fields.length;
  };

  this.dragLeave = function () {
    $scope.dragPlaceholder.visible = false;
  };

  this.dragBeginCanvasField = function (index, field) {

    // Delay is set to prevent browser from copying adjusted html as copy image

    $timeout(function () {
      field.$_isDragging = true;
    }, 1);

    return { source: 'canvas', field: field, index: index };
  };

  this.dragEndCanvasField = function (field) {

    // IE Fix: ensure this is fired after the drag begin

    $timeout(function () {
      field.$_isDragging = false;
//      $scope.dragging = false;
    }, 10);

  };
	$scope.countcheck=0;
	this.fbPageNextEvent=function(arg, len){
		var leng = $('.pageList').attr('id').split('_');
		$('.fg-schema-edit-area').hide();
		if(arg){
			if($scope.countcheck==0){
				$scope.countcheck = len-1;
			}else{
				$scope.countcheck = parseInt(leng[1])-1;
			}
		}else{
			if($scope.countcheck==len-1){
				$scope.countcheck = 0;
			}else{
				$scope.countcheck = parseInt(leng[1])+1;
			}
			//$scope.countcheck = parseInt(leng[1])+1;
		}
		$('#fgEditCanvasId_'+$scope.countcheck).show();
		}
		
		/* this.fbPagePrevEvent=function(schema,index){
			$scope.countcheck--;
			if($scope.countcheck==0){
				this.nextShow=true;
				this.prevShow=false;
			}
			else{
				this.nextShow=true;
				this.prevShow=true;
			}
			for(var j=0;j< (schema.length);j++){	
				if(($scope.countcheck)!=j){
					$('#fgEditCanvasId_'+j).css("display","none")
				}
				else{
					$('#fgEditCanvasId_'+j).css("display","block")
				}
			}
		} */
  

	this.drop = function (indexCount,schema) {
		console.log(indexCount);
		console.log(schema.length);
		/* console.log(indexCount);//alert(indexCount);
		if(schema.length>1){
			this.prevShow=true;
			$scope.countcheck=indexCount;
			console.log($scope.countcheck)
		} 
		if(schema.length==(indexCount+1)){
			this.nextShow=false;
		} */
		setTimeout(function(){
			$scope.countcheck=schema.length-1;
			$scope.$apply();
		}, 100);
		
    var dragData = dqUtils.dragData();
	//debugger
    if (dragData && dragData.data) {

      var field = dragData.data.field;
      var source = dragData.data.source;
      var index = dragData.data.index;
      var fields = $scope.schema[indexCount].fields;

      if (source == 'palette') {
		console.log('p');
        $scope.schemaCtrl.addField(field, $scope.dragPlaceholder.index, indexCount);

      } else if (source == 'canvas') {
		console.log('c');
        $scope.schemaCtrl.moveField(index, $scope.dragPlaceholder.index, indexCount);

        // fields.splice(index, 1);
        // fields.splice($scope.dragPlaceholder.index, 0, field);
      }

      // IE fix: not calling dragEnd sometimes
      field.$_isDragging = false;
    } else {
      throw Error('Drop without data');
    }
  };

}]);
fg.directive('fgEditCanvas', function() {

  return {
    require: ['^fgEdit', '^fgSchema', '^form'],
    templateUrl: 'angular-form-gen/edit/canvas/canvas.ng.html',
    controller: 'fgEditCanvasController as canvasCtrl',
    link: function($scope, $element, $attrs, ctrls) {
      $scope.editCtrl = ctrls[0];
      $scope.schemaCtrl = ctrls[1];
      $scope.formCtrl = ctrls[2];

      var ignoreDirty = true;

      $scope.$watchCollection('schema.fields', function() {
        // Ignore the first call, $watchCollection fires at once without any changes.

        if(!ignoreDirty) {
          $scope.formCtrl.$setDirty(true);
        }

        ignoreDirty = false;

      });
    }
  };
});

fg.controller('fgEditPaletteController', ["$scope", "fgConfig", function ($scope, fgConfig) {

  $scope.templates = [];
  
  var tmpls = fgConfig.fields.templates;
  var i = tmpls.length;
  
  while(i--) {
    var tmpl = tmpls[i];
    
    if(tmpl.editor && tmpl.editor.visible == false) {
      continue;
    }
    
    $scope.templates.unshift(angular.copy(tmpl));
  }
  
  $scope.templateFilter = function (template) {
    return !$scope.selectedCategory || $scope.selectedCategory[template.type];
  };
  
}]);
fg.directive('fgEditPalette',function () {
  return {
    require: ['^fgSchema'],
    templateUrl: 'angular-form-gen/edit/palette/palette.ng.html',
    controller: 'fgEditPaletteController',
    link: function($scope, $element, $attrs, ctrls) {
      $scope.schemaCtrl = ctrls[0];
    }
  };
});
fg.controller('fgFieldController', ["$scope", "fgUtils", function($scope, fgUtils) {
	
  var self = this;
  var _form, _field;

  this.init = function(fgFormCtrl, fieldSchema, editMode) {
    //debugger
    self.initForm(fgFormCtrl);
    self.initField(fieldSchema);
    self.initDefaultData(fieldSchema, editMode);
	console.log(fieldSchema)
    $scope.form = _form;
    $scope.field = _field;
    
  };

  this.initForm = function(fgFormCtrl) {
  //debugger
    _form = fgFormCtrl ? fgFormCtrl.model : {};

    return _form;
  };

  this.initField = function(fieldSchema) {

    _field = {
      $_id: 'id' + fgUtils.getUnique(),
      schema: fieldSchema
    };

    $scope.$watch('field.schema.name', function(value, oldValue) {
      self.registerState(value);
    });

    return _field;
  };

  this.initDefaultData = function(fieldSchema, editMode) {
    var fieldName = fieldSchema.name;

    _form.data = _form.data || {};
    
    if (editMode) {
      
      $scope.$watch('field.schema.value', function(value) {
        _form.data[fieldSchema.name] = value;
      });

      $scope.$watch('field.schema.name', function(value, oldValue) {
        if(value !== oldValue) {
          var data = _form.data[oldValue];
          delete _form.data[oldValue];
          _form.data[value] = data;
        }
      });

    } else if (_form.data && _form.data[fieldName] === undefined && fieldSchema.value !== undefined) {
      _form.data[fieldName] = angular.copy(fieldSchema.value);
    }

    return _form.data;
  };

  this.setFieldState = function(state) {
    // Called by the field-input directive
    _field.state = state;
    self.registerState(_field.schema.name);
  };

  this.registerState = function(fieldName) {
    // Re-register the ngModelCtrl with the form controller
    // whenever the name of the field has been modified.

    if (_form.state && _field.state) {
      _form.state.$removeControl(_field.state);
      _field.state.$name = fieldName;
      _field.state.submit = false;
      _form.state.$addControl(_field.state);
    }

    _field.name = fieldName;

  };

  this.field = function() {
    return _field;
  };

  this.form = function() {
    return _form;
  };
}]);
fg.directive('fgField', ["fgFieldLinkFn", function(fgFieldLinkFn) {

  return {
    require: ['^?fgForm', 'fgField'],
    replace: true,
    templateUrl: 'angular-form-gen/form/field/field.ng.html',
    scope: {
      fieldSchema: '=fgField', // The schema definition of the field
      tabIndex: '=?fgTabIndex', // Optional tab index -- used in overlay mode to disable focus
      editMode: '=?fgEditMode', // Indicates edit mode, which will sync the fieldSchema.value
      // to the form data for WYSIWYG pleasures.
      noValidationSummary: '=fgNoValidationSummary' // If true hides the validation summary
    },
    controller: 'fgFieldController',
    link: fgFieldLinkFn
  };

}]).factory('fgFieldLinkFn', ["fgUtils", function(fgUtils) {
  return function($scope, $element, $attrs, ctrls) {
	
    var fgFormCtrl = ctrls[0];
	//debugger
    var fgFieldCtrl = ctrls[1];

    if ($scope.tabIndex === undefined) {
      $scope.tabIndex = 'auto';
    }

    $scope.renderInfo = fgUtils.getRenderInfo($scope.fieldSchema);

    fgFieldCtrl.init(fgFormCtrl, $scope.fieldSchema, $scope.editMode);
  };
}]);
//fg.directive('fgFieldFocus', function($parse) {
//  return {
//    require: ['?^fgForm'],
//    link: function($scope, $element, $attrs, ctrls) {
//
//      var formCtrl = ctrls[0];
//
//      // if(formCtrl && formCtrl.editMode) {
//      //   return;
//      // }
//
//      var e = $element[0];
//
//      var getModel = $parse($attrs.fgFieldFocus);
//      var setModel = getModel.assign;
//
//      $scope.$watch(getModel, function(value) {
//
//        if (value) {
//          if(formCtrl) {
//            formCtrl.clearFocusOnFields();
//            setModel($scope, true);
//
//            if(formCtrl.editMode) {
//              return;
//            }
//          }
//
//          e.focus();
//
//        } else if(formCtrl && !formCtrl.editMode) {
//
//          e.blur();
//
//        }
//      });
//
//      // function onBlur() {
//      //   // if(getModel($scope) !== undefined) {
//      //   //   $timeout(function() {
//      //   //     setModel($scope, false);
//      //   //   });
//      //   // }
//      // }
//
//      // function onFocus() {
//      //   $timeout(function() {
//      //     setModel($scope, true);
//      //   });
//      // }
//
//      // $element.on('focus', onFocus);
//      // $element.on('blur', onBlur);
//
//      // $scope.$on('$destroy', function() {
//      //   $element.off('focus', onFocus);
//      //   $element.off('blur', onBlur);
//      // });
//    }
//  };
//});

fg.directive('fgFieldInput', ["fgFieldInputLinkFn", function(fgFieldInputLinkFn) {
  return {
    require: ['^fgField', 'ngModel'],
    link: fgFieldInputLinkFn
  };
}]).factory('fgFieldInputLinkFn', function() {
  return function($scope, $element, $attrs, ctrls) {

    var fgFieldCtrl = ctrls[0];
    var ngModelCtrl = ctrls[1];

    fgFieldCtrl.setFieldState(ngModelCtrl);
  };
});
fg.directive('fgFormFields', function() {

  return {
    require: ['^?fgForm'],
    restrict: 'AE',
	controller: 'fgTabsController',
    templateUrl: 'angular-form-gen/form/form-fields/form-fields.ng.html',
    scope: {
		extracts:'='
	},
    link: function($scope, $element, $attrs, ctrls) {
		console.log('inner')
      var fgForm = ctrls[0];
	 $scope.recapInput={input:'',text:''};
      $scope.$watch(function() {
        return fgForm.model;
      }, function(value) {
        $scope.form = value;
      });
	  $scope.countcheckPreview=0
	  $scope.nextpreviewShow=true;
	  $scope.formSubmit = function(){
		$scope.form.state.submit = true;
		console.log($scope)
		console.log($scope.recapInput.input)
		if($scope.recapInput.input==$scope.recap){
			console.log('Success')
			 $scope.recapInput.text="Sucessfully Form Submitted!!";
		}
		else{
			console.log('Error:(')
			$scope.recapInput.text="Please Enter the Valid Recaptcha!!";
		}
	  }
		$scope.fbPagePreviewNextEvent=function(arg, len){
			var leng = $('.pageListPreview').attr('id').split('_');
			$('.fgpreviewElem').hide();
			if(arg){
				if($scope.countcheckPreview==0){
					$scope.countcheckPreview = len-1;
				}else{
					$scope.countcheckPreview = parseInt(leng[1])-1;
				}
			}else{
				if($scope.countcheckPreview==len-1){
					$scope.countcheckPreview = 0;
				}else{
					$scope.countcheckPreview = parseInt(leng[1])+1;
				}
				//$scope.countcheck = parseInt(leng[1])+1;
			}
			$('#fgEditPreviewId_'+$scope.countcheckPreview).show();
		}
		console.log()
		 $scope.recap = "";
			while($scope.recap.length<10&&10>0){
				var r = Math.random();
				$scope.recap+= (r<0.1?Math.floor(r*100):String.fromCharCode(Math.floor(r*26) + (r>0.5?97:65)));
			}
		 
		
		$scope.fgRecaptcha=function(x){
			 $scope.recap = "";
			while($scope.recap.length<x&&x>0){
				var r = Math.random();
				$scope.recap+= (r<0.1?Math.floor(r*100):String.fromCharCode(Math.floor(r*26) + (r>0.5?97:65)));
			}
			console.log($scope.recap)
		}
		console.log($scope.recap)
		
	  
	   
    }
  };

});
fg.controller('fgSchemaController', ["$scope", "fgUtils", function($scope, fgUtils) {

  var _model;

  this.model = function(value) {
    if(value !== undefined) {
      _model = value;

      if(!angular.isArray(value.fields)) {
        value.fields = [];
      }
    }
    
    return _model;
  };

  this.addField = function(field, index, indexCount) {
	//debugger
    var copy = fgUtils.copyField(field);
	if(field.type=='sectionbreak'){
		var emptyArr = {"fields": []};
		_model.push(emptyArr)
		$(".fg-schema-edit-area").hide();
		//console.log($scope);
		//$scope.countcheck = _model.length-1;
		
	}else{
    //index = index === undefined ? _model[pageCount].fields.length : index;
    _model[indexCount].fields.splice(index, 0, copy);
	}

  };

  this.removeField = function(index, indexCount) {
    _model[indexCount].fields.splice(index, 1);
  };

  this.swapFields = function(idx1, idx2) {
	//debugger
    if (idx1 <= -1 || idx2 <= -1 || idx1 >= _model.fields.length || idx2 >= _model.fields.length) {
      return;
    }

    _model.fields[idx1] = _model.fields.splice(idx2, 1, _model.fields[idx1])[0];
  };

  this.moveField = function(fromIdx, toIdx, indexCount) {
	//debugger
    if (fromIdx >= 0 && toIdx <= _model[indexCount].fields.length && fromIdx !== toIdx) {
      var field = _model[indexCount].fields.splice(fromIdx, 1)[0];
      if (toIdx > fromIdx)--toIdx;
      _model[indexCount].fields.splice(toIdx, 0, field);
    }
  };

}]);
fg.directive('fgSchema', ["fgSchemaLinkFn", function(fgSchemaLinkFn) {

  return {
    require: ['fgSchema'],
    controller: 'fgSchemaController',
    link: fgSchemaLinkFn
  };

}]).factory('fgSchemaLinkFn' , function() {
  return function($scope, $element, $attrs, ctrls) {
  
    var schemaCtrl = ctrls[0];
//debugger
    $scope.$watch($attrs.fgSchema, function(value) {
		//debugger
      schemaCtrl.model(value);
    });

  };
});


fg.directive('fgCheckboxlist', function() {

  function validateRequired(validation, value, options) {

    var required = validation ? validation.required : false;

    // Set in field-templates/default/checkboxlist.ng.html

    if(required) {

      // Ensures that at least one option is checked

      var x = options.length;

      while(x--) {
        if(value[options[x].value]) {
          return true;
        }
      }

      return false;
    }

    return true;

  }

  function selectionCount(value) {
    var c = 0;

    for(var k in value) {
      if(value[k]) {
        c += 1;
      }
    }

    return c;
  }

  return {
    require: ['^fgField'],
    link: function($scope, $element, $attrs, $ctrls) {

      var field = $ctrls[0].field();

      var formData = $scope.form.data, schema = field.schema;

      $scope.$watchCollection(function() {
        return formData[schema.name];
      }, function(value, oldValue) {

        // Ensure that the field is marked as dirty on changes
        if(!field.state.$dirty && value !== oldValue) {
          field.state.$setViewValue(value);
        }

        if(schema.validation) {
          var required = validateRequired(schema.validation, value, schema.options);
          field.state.$setValidity('required', required);

          var minc = schema.validation.minoptions;
          var maxc = schema.validation.maxoptions;

          var min = true, max = true;

          if(minc || maxc) {
            var c = selectionCount(value);

            if(minc) {
              min = c >= schema.validation.minoptions;
            }

            if(maxc) {
              max = c <= schema.validation.maxoptions;
            }
          }

          field.state.$setValidity('minoptions', min);
          field.state.$setValidity('maxoptions', max);
        }
      });
    }
  };
});

fg.directive('fgSelectlist', ["$timeout", function($timeout) {

  // Angular adds a '? undefined:undefined ?' option dom element if it cannot find a matching model value in the
  // options list. Somehow this also happens if the value is in the option list. This directive simply removes
  // the invalid option from the dom.

  // https://github.com/angular/angular.js/issues/1019
  // http://stackoverflow.com/questions/12654631/why-does-angularjs-include-an-empty-option-in-select

  return {
    priority: 1000,
    link: function($scope, $element) {

      // Ensure that the ng-repeat has finished by suspending the remove.

      $timeout(function() {

        var $options = $element.find('option');
        var i = $options.length;

        while(--i >= 0) {
          var $option = angular.element($options[i]);
          if($option.val() == '? undefined:undefined ?') {
            $option.remove();
            break;
          }
        }
      }, 0);
    }
  }
}]);

fg.directive('fgEditCanvasField', ["$timeout", function ($timeout) {

  return {
    templateUrl: 'angular-form-gen/edit/canvas/field/field.ng.html',
    link: function ($scope) {

      // Prevent the property tabs from closing if the field schema is invalid

      $scope.toggleProperties = function (field,parIndex,index) {
		//debugger
        if($('#fbEditFieldEle'+parIndex+''+index+':visible').length == 0){
          $('.nam-form-edit-sec .fb-edit-field-block').hide();
          $('#fbEditFieldEle'+parIndex+''+index).show();
          $('.form-extras').hide();
          $('.fg-edit-palette').hide();
          $('.paletteControl').hide();
		   $('.themeContainer').hide();
          }else{
			  $('#fbEditFieldEle'+parIndex+''+index).hide();
			  $('.nam-form-edit-sec .fb-edit-field-block').hide();
			  $('.form-extras').show();
			  $('.fg-edit-palette').show();
			  $('.paletteControl').show();
			  $('.themeContainer').show();
		} 
       /* if (field.$_displayProperties) {
          field.$_displayProperties = field.$_invalid;
        } else {
         */ field.$_displayProperties = true;
        //}
      }

      $scope.finishProperties = function(){

      }

      $scope.closeProperties = function(){
        $('.nam-form-edit-sec .fb-edit-field-block').hide();
        
      }

      $scope.$watch('field.$_displayProperties', function (value) {

        if (value) {
          $scope.expanded = true;
        } else {
          $timeout(function () {
            $scope.expanded = false;
          }, 550);

        }


      });
    }
  };

}]);
fg.controller('fgEditPaletteCategoriesController', ["$scope", "fgConfig", function($scope, fgConfig) {

  $scope.categories = fgConfig.fields.categories;

  $scope.setCategory = function(name, category) {
    $scope.categoryName = name;
		
    $scope.category = category;
	console.log($scope.categoryName)
  };

  if(!$scope.category) {
    //noinspection LoopStatementThatDoesntLoopJS
    for (var name in $scope.categories) {
      //noinspection JSUnfilteredForInLoop
      $scope.setCategory(name, $scope.categories[name]);
      break;
    }
  }
}]);
fg.directive('fgEditPaletteCategories', function () {
  return {
    templateUrl: 'angular-form-gen/edit/palette/categories/categories.ng.html',
    require: '^fgEditPalette',
    scope: {
      category: "=?"
    },
    controller: 'fgEditPaletteCategoriesController'
  };
});
fg.directive('fgEditCanvasFieldProperties', ["fgUtils", function (fgUtils) {

  // To keep the form validation working, the contents of the tabs needs to be rendered even if the tab is not active.

  function setRenderAlways(tabItems) {
    var i = tabItems.length;

    while (i--) {
      var tab = tabItems[i];

      // Skip the debug tab

      if(tab.title !== 'Debug') {
        tab.renderAlways = true;
      }
    }
  }

  return {
    templateUrl: 'angular-form-gen/edit/canvas/field/properties/properties.ng.html',
    scope: {
      field: '=fgEditCanvasFieldProperties'
    },
    link: {
      pre: function ($scope) {
        $scope.property = {};
      },
      post: function ($scope) {

        $scope.$watch('fieldPropertiesForm.$invalid', function (newValue) {
          $scope.field.$_invalid = newValue;
        });

        $scope.renderInfo = fgUtils.getRenderInfo($scope.field);


        $scope.$watch('property.tabs.items.length', function(value) {
          if(value) {
            setRenderAlways($scope.property.tabs.items);
          }
        });

      }
    }
  };
}]);

fg.controller('fgPropertyFieldOptionsController', ["$scope", function($scope) {

  var self = this;
  var optionCounter = 1;

  // Monitor for changes in the options array and ensure a
  // watch for every option value.
  // Watchers are deleted when removing options from the array.

  $scope.$watchCollection('field.options', function(options) {
    if (options) {
      angular.forEach(options, function(option) {
        if (!option.$_valueWatchFn) {
          option.$_valueWatchFn = $scope.$watch(function() {
            return option.value;
          }, handleValueChange);
        }
      });
    }
  });

  function handleValueChange(newValue, oldValue) {

    // Called by the watch collection
    // Ensure that when the selected value is changed, this
    // is synced to the field value.

    if (newValue !== oldValue) {
      if ($scope.multiple) {
        $scope.field.value[newValue] = $scope.field.value[oldValue];
        delete $scope.field.value[oldValue];
      } else {
        if (oldValue === $scope.field.value) {
          $scope.field.value = newValue;
        }
      }
    }
  }

  this.toggleOption = function(optionValue) {

    // Only used in multiple === false
    // Allow the user to deselect an option from the list

    if($scope.field.type !== 'selectlist' && optionValue === $scope.field.value) {
      $scope.field.value = undefined;
    }

  };

  this.addOption = function() {

    if (!$scope.field.options) {
      $scope.field.options = [];
    }

    var option = {
      value: 'Option ' + optionCounter++
    };

    $scope.field.options.push(option);

    var count = $scope.field.options.length;

    if(!$scope.multiple && count === 1) {
      //$scope.field.value = option.value;
    }

  };

  this.removeOption = function(index) {
    var options = $scope.field.options.splice(index, 1);

    if (options && options.length) {

      var option = options[0];

      if ($scope.multiple) {

        if($scope.field.value[option.value] !== undefined)
          delete $scope.field.value[option.value];

      } else {

        if (option.value === $scope.field.value && $scope.field.options.length) {
          $scope.field.value = $scope.field.options[0].value;
        }

        option.$_valueWatchFn();
      }
    }
  };

}]);
fg.directive('fgPropertyFieldOptions', ["fgPropertyFieldOptionsLinkFn", function(fgPropertyFieldOptionsLinkFn) {
  return {
    scope: true,
    controller: 'fgPropertyFieldOptionsController as optionsCtrl',
    templateUrl: 'angular-form-gen/edit/canvas/field/properties/options/options.ng.html',
    link: fgPropertyFieldOptionsLinkFn
  };
}]).factory('fgPropertyFieldOptionsLinkFn', function() {
  return function($scope, $element, $attrs, ctrls) {

    $scope.multiple = false;

    $attrs.$observe('fgPropertyFieldOptions', function(value) {
      if(value === 'multiple') {
        $scope.multiple = true;
      }
    });
  };
});
fg.directive('fgPropertyFieldCommon', ["fgPropertyFieldCommonLinkFn", function(fgPropertyFieldCommonLinkFn) {
  return {
    restrict: 'AE',
    templateUrl: 'angular-form-gen/edit/canvas/field/properties/property-field/common.ng.html',
    link: fgPropertyFieldCommonLinkFn
  };
}]).factory('fgPropertyFieldCommonLinkFn', function() {
  return function($scope, $element, $attrs, ctrls) {

    $scope.fields = {
      fieldname: false,
      displayname: false,
      placeholder: false,
      tooltip: false,
      focus: false,
	  supportingtext:false,
	  fieldoption:false,
	  defaultvalue:false,
	  fieldwidth:false,
	  fieldsize:false,
	  fieldoption_other:false,
	  dateformat:false,
	  allowedyears:false,
	  defaultvalue_date:false,
	  country_dropdown:false,
	  format_dropdown:false,
	  minimalvalue:false,
	  maximalvalue:false,
	  format_phonenumber:false,
	  layout_option:false,
	  heading:false,
	  labelposition:false,
	  columns:false,
	  format_countryaddress:false,
	  fieldoption_validate:false,
	  filetype:false,
	  filepath:false,
	  listoption:false,
	  checkoption:false,
	  dropdownoption:false,
    };

    $scope.$watch($attrs['fgPropertyFieldCommon'], function(value) {
      $scope.fields = angular.extend($scope.fields, value);
    });
  };
});
/*
      The field-value directive will re-render itself when certain validation values are modified.
      This is needed because angular does not watch or observe the values of certain attributes and allows
      an invalid initial value to be saved in the form schema.

      Important: the transcluded form field must be name fieldValue!

      <div fg-property-field-value>
        <input type="text" 
               name="fieldValue" 
               ng-model="field.value" 
               ng-minlength="{{ field.validation.minlength }}"
               ng-maxlength="{{ field.validation.maxlength }}"
               ng-pattern="/{{ field.validation.pattern }}/"/>
      </div>

      The fg-field-redraw directive will trigger, on model change, the field-value to re-render itself.
 */

fg.directive('fgPropertyFieldValue', ["fgPropertyFieldValueLinkFn", function(fgPropertyFieldValueLinkFn) {

  return {
    require: ['^form'],
    templateUrl: 'angular-form-gen/edit/canvas/field/properties/property-field/field-value.ng.html',
    transclude: true,
    link: fgPropertyFieldValueLinkFn
  };

}]).factory('fgPropertyFieldValueLinkFn', ["$parse", function($parse) {

  return function($scope, $element, $attrs, ctrls) {
    $scope.draw = true;
    var frmCtrl = ctrls[0];
    var oldViewValue;

    $scope.$watch('field.$_redraw', function(value) {

      if (value) {

        var ngModelCtrl = frmCtrl['fieldValue'];

        if(ngModelCtrl) {
          oldViewValue = ngModelCtrl.$viewValue;
        }

        $scope.draw = false;
        $scope.field.$_redraw = false;
      } else {
        $scope.draw = true;
        $element = $element;
      }
    });

    $scope.$watch(function() { return frmCtrl['fieldValue']; }, function(ngModelCtrl) {
      if(ngModelCtrl && oldViewValue) {
        ngModelCtrl.$setViewValue(oldViewValue);
        ngModelCtrl.$render();
        oldViewValue = undefined;
      }
    });
  };
}]).directive('fgFieldRedraw', function() {
  return {
    require: ['ngModel'],
    link: function($scope, $element, $attrs, ctrls) {

      var oldValue = $scope.$eval($attrs.ngModel);

      $scope.$watch($attrs.ngModel, function(value) {
        if(value != oldValue) {
          $scope.field.$_redraw = true;
          oldValue = value;
        }
      });
    }
  };
});

fg.directive('fgPropertyField', ["fgPropertyFieldLinkFn", function(fgPropertyFieldLinkFn) {

  return {
    restrict: 'AE',
    templateUrl: 'angular-form-gen/edit/canvas/field/properties/property-field/property-field.ng.html',
    transclude: true,
    scope: true,
    link: fgPropertyFieldLinkFn
  };

}]).factory('fgPropertyFieldLinkFn', function() {
  return function($scope, $element, $attrs, ctrls) {
    
    $attrs.$observe('fgPropertyField', function(value) {
      $scope.fieldName = value;
    });

    $attrs.$observe('fgPropertyFieldLabel', function(value) {
      if(value) {
        $scope.fieldLabel = value;
      }
    });

  };
});
fg.directive('fgParsePattern', function() {

  return {
    require: ['ngModel'],
    link: function($scope, $element, $attrs, ctrls) {
      var ngModelCtrl = ctrls[0];

      ngModelCtrl.$parsers.push(validate);
      
      function validate(value) {
        try {
          new RegExp(value);
        } catch(e) {
          ngModelCtrl.$setValidity('pattern', false);
          return undefined;
        }

        ngModelCtrl.$setValidity('pattern', true);
        return value;
      }
    }
  };
});
fg.directive('fgPropertyFieldValidation', ["fgPropertyFieldValidationLinkFn", function(fgPropertyFieldValidationLinkFn) {
  return {
    restrict: 'A',
    templateUrl: 'angular-form-gen/edit/canvas/field/properties/validation/validation.ng.html',
    link: fgPropertyFieldValidationLinkFn
  };
}]).factory('fgPropertyFieldValidationLinkFn', ["fgConfig", function(fgConfig) {

  var patternOptions = [];
  var patternConfig = fgConfig.validation.patterns;

  angular.forEach(patternConfig, function(value, text) {
    patternOptions.push({ value: value, text: text });
  });

  return function($scope, $element, $attrs, ctrls) {

    $scope.patternOptions = patternOptions;

    $scope.field.validation = $scope.field.validation || {};
    $scope.field.validation.messages = $scope.field.validation.messages || {};

    $scope.fields = {
      required: false,
      minlength: false,
      maxlength: false,
      pattern: false
    };

    $scope.$watch($attrs['fgPropertyFieldValidation'], function(value) {
      $scope.fields = angular.extend($scope.fields, value);
    });
  };
}]);
fg.directive('fgEditValidationMessage', ["fgEditValidationMessageLinkFn", function(fgEditValidationMessageLinkFn) {
  return {
    templateUrl: 'angular-form-gen/edit/canvas/field/properties/validation/validation-message.ng.html',
    link: fgEditValidationMessageLinkFn,
    scope: true
  };
}]).factory('fgEditValidationMessageLinkFn', function() {

  var DEFAULT_TOOLTIP = "Enter a error message here that will be shown if this validation fails. If this field is empty a default message will be used.";
  
  return function($scope, $element, $attrs, ctrls) {
    $attrs.$observe('fgEditValidationMessage', function(value) {
      $scope.validationType = value;
    });

    $attrs.$observe('fgEditValidationTooltip', function(value) {
      value = value || DEFAULT_TOOLTIP;
      $scope.tooltip = value;
    });
  };
});
})(angular);
//# sourceMappingURL=angular-form-gen.js.map