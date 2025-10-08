export class BuildCommandHelp {
  private aliases: string = null!;
  private usages: string = null!;
  private details: string = null!;
  private description: string = null!;

  public setAliases(text: string) {
    this.aliases = text;
    return this;
  }

  public setUsages(text: string) {
    this.usages = text;
    return this;
  }

  public setDetails(text: string) {
    this.details = text;
    return this;
  }

  public setDescription(text: string) {
    this.description = text;
    return this;
  }

  public display(
    name: string,
    aliases: string | null,
    options: LanguageHelpDisplayOptions,
    prefixUsed: string,
    description: string,
  ) {
    const { usages = [], details } = options;
    const output: string[] = [];

    // Simple Description
    if (description) {
      output.push(this.description, description, "");
    }

    // Usages
    if (usages.length) {
      output.push(
        this.usages,
        ...usages.map((usage) => `→ ${prefixUsed}${name}${usage.length === 0 ? "" : ` *${usage}*`}`),
        "",
      );
    }

    // Aliases
    if (aliases !== null) {
      output.push(`${this.aliases}: ${aliases}`, "");
    }

    // Extended help
    if (details) {
      output.push(this.details, details, "");
    }

    return output.join("\n");
  }
}

export interface LanguageHelpDisplayOptions {
  usages?: string[];
  details?: string;
}
