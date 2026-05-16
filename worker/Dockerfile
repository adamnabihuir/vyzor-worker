FROM python:3.12-slim

# ── System tools ─────────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    nmap \
    wget \
    curl \
    unzip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ── subfinder (latest release) ────────────────────────────────────────────────
RUN ARCH=$(dpkg --print-architecture) && \
    wget -qO /tmp/subfinder.zip \
      "https://github.com/projectdiscovery/subfinder/releases/latest/download/subfinder_linux_${ARCH}.zip" && \
    unzip /tmp/subfinder.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/subfinder && \
    rm /tmp/subfinder.zip

# ── nuclei (latest release) ───────────────────────────────────────────────────
RUN ARCH=$(dpkg --print-architecture) && \
    wget -qO /tmp/nuclei.zip \
      "https://github.com/projectdiscovery/nuclei/releases/latest/download/nuclei_linux_${ARCH}.zip" && \
    unzip /tmp/nuclei.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/nuclei && \
    rm /tmp/nuclei.zip

# ── nuclei templates (community templates) ────────────────────────────────────
RUN nuclei -update-templates -silent || true

# ── Python app ────────────────────────────────────────────────────────────────
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["python", "-u", "main.py"]
