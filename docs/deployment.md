# Deploying to srgportfol.io

The workflow `.github/workflows/pages.yml` publishes `site/` on every push to `main`. The
domain's DNS is in Route 53 (AWS); the registration is at IONOS and expires in January 2027.

## 1. Push and turn on Pages

```
git remote add origin https://github.com/srg092618/srgportfol.git
git push -u origin main
```

On GitHub: **Settings > Pages > Build and deployment > Source: GitHub Actions**. Then check
the **Actions** tab for a green run. The site is now at `https://srg092618.github.io/srgportfol/`.

## 2. Point the domain at GitHub (Route 53)

In **Route 53 > Hosted zones > srgportfol.io**, delete the old alias record that points at
the S3 website endpoint, then create:

| Name | Type | Value |
|---|---|---|
| `srgportfol.io` | A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `srgportfol.io` | AAAA | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| `www.srgportfol.io` | CNAME | `srg092618.github.io` |

Check these against GitHub's page "Managing a custom domain for your GitHub Pages site"
before saving, since GitHub can change them. Leave the NS and SOA records alone.

## 3. Custom domain and HTTPS

In **Settings > Pages**, enter `srgportfol.io` as the custom domain. When the DNS check
passes, tick **Enforce HTTPS** (the certificate can take up to an hour). No `CNAME` file is
needed when deploying with Actions.

## 4. Clean up

- Empty and delete the old `srgportfol.io` S3 bucket.
- Renew the domain at IONOS, or transfer it, well before January 2027.
