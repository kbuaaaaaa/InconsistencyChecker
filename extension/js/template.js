/* eslint-disable max-classes-per-file */

class Template {
  constructor(name = 'untitled', color = [], font = [], border = []) {
    this.name = name;
    this.color = color;
    this.font = font;
    this.border = border;
  }

  compare(element) {
    let fontResult = PROPERTY.None;
    let borderResult = PROPERTY.None;
    let colorResult = PROPERTY.None;
    let result = false;

    for (const f of this.font) {
      let fontMatch = true;
      if (f.fontStyle !== element.font.fontStyle) {
        fontMatch = false;
      }
      if (f.fontVariant !== element.font.fontVariant) {
        fontMatch = false;
      }
      if (f.fontWeight !== element.font.fontWeight) {
        fontMatch = false;
      }

      if (f.fontSize !== '' && f.fontSize !== element.font.fontSize) {
        fontMatch = false;
      }
      if (f.lineHeight !== '' && f.lineHeight !== element.font.lineHeight) {
        fontMatch = false;
      }

      if (f.fontFamily !== '' && f.fontFamily !== element.font.fontFamily) {
        fontMatch = false;
      }
      if (fontMatch === true) {
        fontResult = PROPERTY.Consistent;
        break;
      } else {
        fontResult = PROPERTY.Inconsistent;
      }
    }

    for (const b of this.border) {
      let match = true;
      if (b.borderStyle !== element.border.borderStyle) {
        match = false;
      }
      if (
        b.borderWidth !== ''
        && b.borderWidth !== element.border.borderWidth
      ) {
        match = false;
      }
      if (
        b.borderColor !== ''
        && b.borderColor !== element.border.borderColor
      ) {
        match = false;
      }
      if (match === true) {
        borderResult = PROPERTY.Consistent;
        break;
      } else {
        borderResult = PROPERTY.Inconsistent;
      }
    }

    for (const c of this.color) {
      if (c.color !== element.color.color) {
        colorResult = PROPERTY.Inconsistent;
      } else {
        colorResult = PROPERTY.Consistent;
        break;
      }
    }
    if (
      fontResult === PROPERTY.Inconsistent
      || colorResult === PROPERTY.Inconsistent
      || borderResult === PROPERTY.Inconsistent
    ) {
      result = true;
    }
    return [result, fontResult, colorResult, borderResult];
  }
}

class Element {
  constructor(
    code = '',
    id = '',
    className = '',
    number = '',
    color = new Color(),
    font = new Font(),
    border = new Border(),
  ) {
    this.code = code;
    this.id = id;
    this.className = className;
    this.number = number;
    this.color = color;
    this.font = font;
    this.border = border;
  }
}

class Font {
  constructor(
    fontStyle = FONT_STYLE.Normal,
    fontVariant = FONT_VARIANT.Normal,
    fontWeight = FONT_WEIGHT.Normal,
    fontSize = 0,
    lineHeight = 0,
    fontFamily = '',
  ) {
    // https://www.w3schools.com/cssref/pr_font_font-style.asp for value ref.
    this.fontStyle = fontStyle;
    this.fontVariant = fontVariant;
    this.fontWeight = fontWeight;
    this.fontSize = fontSize;
    this.lineHeight = lineHeight;
    this.fontFamily = fontFamily;
  }

  toString() {
    let result = `&emsp;Font Style : ${this.fontStyle}<br>&emsp;Font Variant : ${this.fontVariant}<br>&emsp;Font Weight : ${this.fontWeight}<br>`;
    if (this.fontSize !== '') {
      result += `&emsp;Font Size : ${this.fontSize}<br>`;
    }
    if (this.lineHeight !== '') {
      result += `&emsp;Line Height : ${this.lineHeight}<br>`;
    }

    if (this.fontFamily !== '') {
      result += `&emsp;Font Family : ${this.fontFamily}<br>`;
    }
    return result;
  }
}

class Color {
  constructor(color = '#FFFFFF') {
    this.color = color;
  }

  toString() {
    const result = `&emsp;Color: ${this.color}<br>`;
    return result;
  }
}

class Border {
  constructor(
    borderWidth = 0,
    borderStyle = BORDER_STYLE.None,
    borderColor = '',
  ) {
    this.borderWidth = borderWidth;
    this.borderStyle = borderStyle;
    this.borderColor = borderColor;
  }

  toString() {
    let result = '';
    if (this.borderWidth !== '') {
      result += `&emsp;Border Width : ${this.borderWidth}<br>`;
    }
    const bs = this.borderStyle;
    result += `&emsp;Border Style : ${bs}<br>`;
    if (this.borderColor !== '') {
      result += `&emsp;Border Color : ${this.borderColor}<br>`;
    }
    return result;
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    Template,
    Element,
    Font,
    Color,
    Border,
  };
}
