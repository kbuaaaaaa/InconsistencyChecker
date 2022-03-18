const FONT_STYLE = {
  None: '',
  Default: 'normal',
  // The browser displays a normal font style. This is default
  Normal: 'normal',
  // The browser displays an italic font style
  Italic: 'italic',
  // The browser displays an oblique font style
  Oblique: 'oblique',
  // Sets this property to its default value
  Initial: 'initial',
  // Inherits this property from its parent element
  Inherit: 'inherit',
};
const FONT_VARIANT = {
  None: '',
  Default: 'normal',
  Normal: 'normal',
  // The browser displays a normal font. This is default
  Small_Caps: 'small-caps',
  // The browser displays a small-caps font
  Initial: 'initial',
  // Sets this property to its default value. Read about initial
  Inherit: 'inherit',
  // Inherits this property from its parent element.
};

const FONT_WEIGHT = {
  100: '100',
  200: '200',
  300: '300',
  400: '400',
  500: '500',
  600: '600',
  700: '700',
  800: '800',
  900: '900',
  // Defines from thin to thick characters. 400 is the same as normal, and 700 is the same as bold
  None: '',
  Default: 'normal',
  Normal: 'normal',
  // Defines normal characters. This is default
  Bold: 'bold',
  // Defines thick characters
  Bolder: 'bolder',
  // Defines thicker characters
  Lighter: 'lighter',
  // Defines lighter characters
  Initial: 'initial',
  // Sets this property to its default value. Read about initial
  Inherit: 'inherit',
  // Inherits this property from its parent element.
};

const GENERIC_FAMILY = {
  None: '',
  Default: 'sans-serif',
  // The amazon.com pages use sans-serif as their default
  Serif: 'serif',
  Sans_Serif: 'sans-serif',
  Cursive: 'cursive',
  Fantasy: 'fantasy',
  Monospace: 'monospace',
};

const BORDER_STYLE = {
  None: '',
  Default: 'none',
  // Default value. Specifies no border
  Hidden: 'hidden',
  // The same as "none", except in border conflict resolution for table elements
  Dotted: 'dotted',
  // Specifies a dotted border
  Dashed: 'dashed',
  // Specifies a dashed border
  Solid: 'solid',
  // Specifies a solid border
  Double: 'double',
  // Specifies a double border
  Groove: 'groove',
  // Specifies a 3D grooved border. The effect depends on the border-color value
  Ridge: 'ridge',
  // Specifies a 3D ridged border. The effect depends on the border-color value
  Inset: 'inset',
  // Specifies a 3D inset border. The effect depends on the border-color value
  Outset: 'outset',
  // Specifies a 3D outset border. The effect depends on the border-color value
  Initial: 'initial',
  // Sets this property to its default value. Read about initial
  Initial: 'inherit', // eslint-disable-line no-dupe-keys
  // Inherits this property from its parent element. Read about inherit
};

const PROPERTY = {
  None: 'none',
  Consistent: 'consistent',
  Inconsistent: 'inconsistent',
};

if (typeof module !== 'undefined') {
  module.exports = {
    FONT_STYLE,
    FONT_VARIANT,
    FONT_WEIGHT,
    GENERIC_FAMILY,
    BORDER_STYLE,
    PROPERTY,
  };
}
