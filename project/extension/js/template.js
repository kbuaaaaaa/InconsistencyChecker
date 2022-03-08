class Template{
    constructor(name = "untitled" , color = [], font = [], border = []){
        this.name =  name; 
        this.color = color;
        this.font = font;
        this.border = border;
    }

    compare(element){
      let fontResult = PROPERTY.None,
          borderResult = PROPERTY.None,
          colorResult = PROPERTY.None,
          result = false;
      
      for (const f of this.font) {
        let font_match = true;
        if (f.font_style !== element.font.font_style) {
          font_match = false;
        }
        if (f.font_variant !== element.font.font_variant) {
          font_match = false;
        }
        if (f.font_weight !== element.font.font_weight) {
          font_match = false;
        }
        
        if (f.font_size !== "" && f.font_size !== element.font.font_size) {
          font_match = false;
            
        }
        if (f.line_height !== "" && f.line_height !== element.font.line_height) {
          font_match = false;
        }

        if (f.font_family !== "" && f.font_family !== element.font.font_family) {
          font_match = false;
        }
        if(font_match == true){
          fontResult = PROPERTY.Consistent;
          break;
        }else{
          fontResult = PROPERTY.Inconsistent;
        }
      }

      for (const b of this.border) {
        let match = true;
        if (b.border_style !== element.border.border_style) {
          match = false;
        }
        if (b.border_width !== "" && b.border_width !== element.border.border_width) {
            match = false;
        }
        if (b.border_color !== "" && b.border_color !== element.border.border_color) {
            match = false;
        }
        if(match == true){
          borderResult = PROPERTY.Consistent;
          break;
        }else{
          borderResult = PROPERTY.Inconsistent;
        }
      }

      for (const c of this.color) {
        if (c.color !== element.color.color) {
          colorResult = PROPERTY.Inconsistent
        }else{
          colorResult = PROPERTY.Consistent
          break;
        }
      }
      if (fontResult == PROPERTY.Inconsistent || colorResult == PROPERTY.Inconsistent || borderResult == PROPERTY.Inconsistent) {
        result = true;
      }
      return [result, fontResult, colorResult, borderResult];
    }

}

class Element{
  constructor(code = "", id = "", className = "", number = "", color = new Color(), font = new Font(), border = new Border()){
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
    let result = `&emsp;Font Style : ${this.font_style}<br>&emsp;Font Variant : ${this.font_variant}<br>&emsp;Font Weight : ${this.font_weight}<br>`;
    if (this.font_size !== "") {
      result += `&emsp;Font Size : ${this.font_size}<br>`;
    }
    if (this.line_height !== "") {
      result += `&emsp;Line Height : ${this.line_height}<br>`;
    }

    if (this.font_family !== "") {
      result += `&emsp;Font Family : ${this.font_family}<br>`
    }
    return result;
  }
}

class Color {
  constructor(color="#FFFFFF") {
    this.color = color;
  }

  toString(){
    let result = `&emsp;Color: ${this.color}<br>`;
    return result;
  }
}

class Border {
  constructor(
    border_width = 0,
    border_style = BORDER_STYLE.None,
    border_color = ""
  ) {
    this.border_width = border_width;
    this.border_style = border_style;
    this.border_color = border_color;
  }

  toString(){
    let result = "";
    if (this.border_width !== "") {
      result += `&emsp;Border Width : ${this.border_width}<br>`;
    }
    var bs = this.border_style
    result += `&emsp;Border Style : ${bs}<br>`;
    if (this.border_color !== "") {
      result += `&emsp;Border Color : ${this.border_color}<br>`
    }
    return result;
  }
}

module.exports = {
  Template,
  Element,
  Font,
  Color,
  Border
};