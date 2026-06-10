const required = [];
const missing = required.filter((name) => !process.env[name] || !process.env[name].trim());

if (missing.length > 0) {
  console.error(
    [
      "Missing required public build environment variable(s):",
      missing.map((name) => `- ${name}`).join("\n"),
      "",
      "GitHub Pages deploy is intentionally blocked.",
      "Set the missing value in GitHub repo Settings > Secrets and variables > Actions > Variables.",
    ].join("\n")
  );
  process.exit(1);
}
