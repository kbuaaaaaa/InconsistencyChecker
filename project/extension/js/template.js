class Template{
    constructor(color = [], font = [], border = []){
        this.color = color;
        this.font = font;
        this.border = border;
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
    font_family = "",
    generic_family = GENERIC_FAMILY.Default
  ) {
    //https://www.w3schools.com/cssref/pr_font_font-style.asp for value ref.
    this.font_style = font_style;
    this.font_variant = font_variant;
    this.font_weight = font_weight;
    this.font_size = font_size;
    this.line_height = line_height;
    this.font_name = font_name;
    this.font_family = font_family;
    this.generic_family = generic_family;
  }
}

class Color {
  constructor(color="#FFFFFF") {
    this.color = color;
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
}
