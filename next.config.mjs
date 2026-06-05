/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? "/growthagent" : "",
  assetPrefix: isGitHubPages ? "/growthagent/" : "",
  images: {
    unoptimized: true
  }
};

export default nextConfig;
