#!/usr/bin/env bash
set -euo pipefail

NPM_VERSION="${1:-11.14.1}"
NPM_HOME="${RUNNER_TEMP:-/tmp}/npm-${NPM_VERSION}"
NPM_PACKAGE_DIR="${NPM_HOME}/lib/node_modules/npm"

rm -rf "${NPM_HOME}"
mkdir -p "${NPM_HOME}/bin" "${NPM_PACKAGE_DIR}"

curl -fsSL "https://registry.npmjs.org/npm/-/npm-${NPM_VERSION}.tgz" \
	| tar -xz -C "${NPM_PACKAGE_DIR}" --strip-components=1

cat > "${NPM_HOME}/bin/npm" <<EOF
#!/usr/bin/env bash
exec node "${NPM_PACKAGE_DIR}/bin/npm-cli.js" "\$@"
EOF

cat > "${NPM_HOME}/bin/npx" <<EOF
#!/usr/bin/env bash
exec node "${NPM_PACKAGE_DIR}/bin/npx-cli.js" "\$@"
EOF

chmod +x "${NPM_HOME}/bin/npm" "${NPM_HOME}/bin/npx"

if [[ -n "${GITHUB_PATH:-}" ]]; then
	echo "${NPM_HOME}/bin" >> "${GITHUB_PATH}"
fi

"${NPM_HOME}/bin/npm" --version
