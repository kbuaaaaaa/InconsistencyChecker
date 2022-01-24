class Template{
    constructor(){
        this.type = "";
        this.color = "";
        this.font = "";
        this.border = "";
        this.width = 0;
        this.height = 0;
    }
}

class Font{
    constructor(){
        //https://www.w3schools.com/cssref/pr_font_font-style.asp for value ref.
        this.font_style = FONT_STYLE.Normal;
        this.font_variant = FONT_VARIANT.Normal;
        this.font_weight = FONT_WEIGHT.Normal;
        this.font_size = 0;
        this.line_height = 0;
        this.font_name = "";
        this.font_family = "";
        this.generic_family = GENERIC_FAMILY.Sans_Serif;
    }
}