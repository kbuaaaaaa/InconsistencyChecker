class Template{
    constructor(color = [], font = [], border = []){
        this.color = color;
        this.font = font;
        this.border = border;
    }

    compare(element){
      let fontResult = PROPERTY.None,
          borderResult = PROPERTY.None,
          colorResult = PROPERTY.None
      
      for (const font of this.font) {
        let match = true;
        if (FONT_STYLE[font.font_style] !== element.font.font_style) {
          match = false;
        }
        if (FONT_VARIANT[font.font_variant] !== element.font.font_variant) {
          match = false;
        }
        if (FONT_WEIGHT[font.font_weight] !== element.font.font_weight) {
          match = false;
        }
        if (font.font_size !== "") {
          if (font.font_size !== element.font.font_size) {
            match = false;
          }
        }
        if (font.line_height !== "") {
          if (font.line_height !== element.font.line_height) {
            match = false;
          }
        }

        if (font.font_family !== "") {
          if (font.font_family !== element.font.font_family) {
            match = false;
          }
        }
        if(match){
          fontResult = PROPERTY.Consistent;
          break;
        }else{
          fontResult = PROPERTY.Inconsistent;
        }
      }

      for (const border of this.border) {
        let match = true;
        if (BORDER_STYLE[border.border_style] !== element.border.border_style) {
          match = false;
        }
        if (border.border_width !== "") {
          if (border.border_width !== element.border.border_width) {
            match = false;
          }
        }
        if (border.border_color !== "") {
          if (border.border_color !== element.border.border_color) {
            match = false;
          }
        }
        if(match){
          borderResult = PROPERTY.Consistent;
          break;
        }else{
          borderResult = PROPERTY.Inconsistent;
        }
      }

      for (const color of this.color) {
        if (color.color !== element.color.color) {
          colorResult = PROPERTY.Inconsistent
        }else{
          colorResult = PROPERTY.Inconsistent
          break;
        }
      }

      return {fontResult, colorResult, borderResult};
    }

}

class Element{
  constructor(code = "", color = new Color(), font = new Font(), border = new Border()){
      this.code = code;
      this.color = color;
      this.font = font;
      this.border = border;
  }
}

class Font {
  constructor(
    font_style = FONT_STYLE.Normal,
    font_variant = FONT_VARIANT.Normal,
    font_weight = FONT_WEIGHT.Normal,
    font_size = 0,
    line_height = 0,
    font_family = ""
  ) {
    //https://www.w3schools.com/cssref/pr_font_font-style.asp for value ref.
    this.font_style = font_style;
    this.font_variant = font_variant;
    this.font_weight = font_weight;
    this.font_size = font_size;
    this.line_height = line_height;
    this.font_family = font_family;
  }

  toString(){
    let result = `Font Style : ${FONT_STYLE[this.font_style]}<br>Font Variant : ${FONT_VARIANT[this.font_variant]}<br>Font Weight : ${FONT_WEIGHT[this.font_weight]}<br>}`;
    if (this.font_size !== "") {
      result += `Font Size : ${this.font_size}<br>`;
    }
    if (this.line_height !== "") {
      result += `Line Height : ${this.line_height}<br>`;
    }

    if (this.font_family !== "") {
      result += `Font Family : ${this.font_family}<br>`
    }
    return result;
  }
}

class Color {
  constructor(color="#FFFFFF") {
    this.color = color;
  }

  toString(){
    return this.color;
  }
}

class Border {
  constructor(
    border_width = 0,
    border_style = BORDER_STYLE.None,
    border_color = new Color()
  ) {
    this.border_width = border_width;
    this.border_style = border_style;
    this.border_color = border_color;
  }

  toString(){
    let result = "";
    if (this.border_width !== "") {
      result += `Border Width : ${this.border_width}<br>`;
    }
    result += `Border Style : ${this.border_style}<br>`;
    if (this.border_color !== "") {
      result += `Border Color : ${this.border_color.toString()}<br>`
    }
    return result;
  }
}
