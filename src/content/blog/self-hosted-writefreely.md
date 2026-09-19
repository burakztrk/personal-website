---
title: Self Hosted Writefreely
date: 2026-09-19
tags: [selfhosting, docker]
accent: warning
excerpt: Compiling WriteFreely from source and running it on EasyPanel with Docker Compose.
---

Compiling WriteFreely — a self-hosted, minimalist blogging platform — from Go source and running it on EasyPanel via Docker Compose.

**Stack:**
- Docker / Docker Compose
- EasyPanel (PaaS management UI)
- Go 1.23 (language)
- SQLite (database)
- Node.js + LESS (compiling static assets)
- Reverse proxy: EasyPanel (TLS / HTTPS management)

## 1. Goal

- Run WriteFreely on EasyPanel under my own domain (ozturk.ai)
- Get the TLS certificate through EasyPanel
- Persist the configuration to a volume
- Compile the required static files (templates, CSS)
- Resolve any errors as they come up

## 2. The Compose setup

The following minimal setup was entered into EasyPanel's Docker Compose tab:

```
services:
  wf_buildbox:
    image: golang:1.23-alpine
    user: "0:0"
    tty: true
    stdin_open: true
    working_dir: /srv/wf
    volumes:
      - wf_home:/srv/wf
    command: ["/bin/sh","-c","mkdir -p /srv/wf && tail -f /dev/null"]
    expose:
      - "8080"

volumes:
  wf_home:
```

With this setup:
- The container stays up (never exits)
- Console access is active
- All build output persists in the `/srv/wf` volume

## 3. Installing the required tools

From the console (EasyPanel → Console):

```
apk update
apk add --no-cache git build-base nodejs npm sqlite-dev ca-certificates bash
```

## 4. Fetching the source

```
cd /srv/wf
mkdir -p src bin data
cd src
git clone https://github.com/writefreely/writefreely.git
cd writefreely
```

## 5. Building

WriteFreely now requires Go 1.23, which is why the `golang:1.23-alpine` image was chosen. Make sure `go.mod` is present in the current directory.

```
go version   # should be go1.23.x
go build -v -tags='sqlite' -o /srv/wf/bin/writefreely ./cmd/writefreely/
```

**Errors resolved along the way:**
> ❌ `go.mod file not found` — was in the wrong directory
> ❌ `go: go.mod requires go >= 1.23.0` — switched the image to `golang:1.23-alpine`

## 6. Compiling static assets

```
npm i -g less less-plugin-clean-css clean-css
cd less
CSSDIR=../static/css
lessc app.less   --clean-css="--s1 --advanced" ${CSSDIR}/write.css
lessc fonts.less --clean-css="--s1 --advanced" ${CSSDIR}/fonts.css
lessc icons.less --clean-css="--s1 --advanced" ${CSSDIR}/icons.css
lessc prose.less --clean-css="--s1 --advanced" ${CSSDIR}/prose.css
cd ../prose
npm install
npm run build
```

## 7. Configuration and database

```
/srv/wf/bin/writefreely -c /srv/wf/data/config.ini --config
/srv/wf/bin/writefreely -c /srv/wf/data/config.ini --init-db
/srv/wf/bin/writefreely -c /srv/wf/data/config.ini --gen-keys
```

## 8. Running it

Important: `working_dir` must be the **repo root** (that's where `templates` and `static` live).

New Compose:

```
services:
  wf_buildbox:
    image: golang:1.23-alpine
    user: "0:0"
    working_dir: /srv/wf/src/writefreely
    volumes:
      - wf_home:/srv/wf
    command: ["/srv/wf/bin/writefreely","-c","/srv/wf/data/config.ini"]
    expose:
      - "8080"

volumes:
  wf_home:
```

**Error resolved:**
> ❌ `load templates: no such file or directory`
> → set `working_dir` to `/srv/wf/src/writefreely`

## 9. Domain settings (EasyPanel)

- **Domain:** ozturk.ai
- **Service:** wf_buildbox
- **Internal port:** 8080
- **TLS:** Let's Encrypt (Cloudflare DNS only → grey-clouded)

## 10. Errors and fixes

<div class="nes-table-responsive">
<table class="nes-table is-bordered is-centered">
<thead>
<tr>
<th>Error</th>
<th>Cause</th>
<th>Fix</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>go.mod file not found</code></td>
<td>Wrong directory</td>
<td><code>cd writefreely</code></td>
</tr>
<tr>
<td><code>requires go &gt;= 1.23.0</code></td>
<td>Old Go version</td>
<td><code>golang:1.23-alpine</code></td>
</tr>
<tr>
<td><code>Permission denied</code></td>
<td>No write permission on the volume</td>
<td><code>user: "0:0"</code> + <code>chmod 0777</code></td>
</tr>
<tr>
<td><code>templates: no such file</code></td>
<td>Wrong working directory</td>
<td><code>working_dir: /srv/wf/src/writefreely</code></td>
</tr>
<tr>
<td><code>Using autocert on host localhost</code></td>
<td>Autocert enabled</td>
<td><code>autocert = false</code> + <code>port = 8080</code></td>
</tr>
<tr>
<td>URLs show <code>localhost:8080</code></td>
<td><code>base_url</code> missing</td>
<td><code>base_url = "https://ozturk.ai"</code></td>
</tr>
<tr>
<td><code>Collection.hostName is empty!</code></td>
<td>Host column empty in the DB</td>
<td><code>UPDATE collections SET host='ozturk.ai';</code></td>
</tr>
</tbody>
</table>
</div>

## 11. Current state

- `https://ozturk.ai` is live
- TLS certificate is managed by EasyPanel
- `base_url` and `host` settings are correct
- No errors in the console

## 12. Extra notes

- To create an admin user: `bash /srv/wf/bin/writefreely -c /srv/wf/data/config.ini --create-admin admin:StrongPassword`
- EasyPanel manages the reverse proxy, so HTTPS must stay disabled on WriteFreely's own side.
- Backing up the volume (`/srv/wf/data`) is enough.

## Result

Minimalist blogging infrastructure (WriteFreely), modern reverse proxy management (EasyPanel), a persistent volume, secure TLS, and a systematic run through every error along the way — all done.
