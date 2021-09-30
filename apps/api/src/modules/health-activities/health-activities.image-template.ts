export default `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Lato&display=swap"
    />

    <style>
      *,
      *::before,
      *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        pointer-events: none;
        user-select: none;
      }

      body {
        width: 1080px;
        font-family: Lato, system-ui, -apple-system, Segoe UI, Roboto,
          Helvetica Neue, Arial, Noto Sans, Liberation Sans, sans-serif,
          Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
        font-weight: 400;
        font-size: 2.8vw;
        line-height: 1;
        letter-spacing: 0.025em;
        color: white;
        background-color: white;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .container {
        position: relative;
        width: 100%;
        overflow: hidden;
        min-height: 600px;
      }

      .bg-image {
        display: block;
        width: 100%;
        height: auto;
        opacity: 0;
      }

      .bg-image-cover {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .content {
        position: absolute;
        display: flex;
        align-items: center;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 1.42857143em;
      }

      .content * {
        position: relative;
        z-index: 1;
      }

      .content::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        min-height: 12.85714286em;
        background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8));
        mix-blend-mode: multiply;
      }

      .logo-container {
        flex: 0 0 auto;
        position: relative;
        margin-right: auto;
      }

      .logo {
        display: block;
        width: auto;
        height: 2em;
        margin-right: auto;
      }

      .link {
        position: absolute;
        top: 2.4em;
        left: 4.2em;
        font-size: 0.71428571em;
      }

      .stat {
        margin-left: 2em;
      }

      .stat-value {
        margin-bottom: 0.28571429em;
      }

      .stat-value:last-child {
        margin-bottom: 0;
      }

      .stat-label {
        font-size: 0.57142857em;
        text-transform: uppercase;
      }

      @media (max-aspect-ratio: 3/4) {
        body {
          font-size: 5.6vw;
        }

        .content {
          flex-direction: column;
          align-items: flex-start;
          width: auto;
        }

        .content::before {
          min-height: 0;
          background: linear-gradient(
            to left,
            rgba(0, 0, 0, 0),
            rgba(0, 0, 0, 0.8)
          );
          filter: blur(1em);
          transform: scale(1.25);
          transform-origin: 100% 0;
        }

        .logo-container {
          order: 100;
        }

        .logo {
          height: 1.5em;
        }

        .link {
          font-size: 0.53571428em;
        }

        .stat {
          margin-left: 0;
          margin-bottom: 1.5em;
        }
      }
    </style>
  </head>

  <body>
    <div class="container">
      {{#if imageUrl}}
        <img
          class="bg-image"
          src="{{imageUrl}}"
          alt=""
        />

        <img
          class="bg-image-cover"
          src="{{imageUrl}}"
          alt=""
        />
      {{/if}}

      <div class="content">
        <div class="logo-container">
          <svg
            class="logo"
            xmlns="http://www.w3.org/2000/svg"
            width="143.877"
            height="28"
            viewBox="0 0 143.877 28"
          >
            <circle cx="14" cy="14" r="14" fill="#00e9d7" />
            <g transform="translate(42.463 6.769)">
              <path
                d="M52.536,10.239q-.655,0-1.174.05a2.364,2.364,0,0,0-.882.245,1.291,1.291,0,0,0-.555.576,2.365,2.365,0,0,0-.191,1.044v.52H60.175v2.985H49.734v5.594H46V11.838A5.527,5.527,0,0,1,46.313,9.9a3.238,3.238,0,0,1,1.063-1.441,5.248,5.248,0,0,1,1.976-.9,12.745,12.745,0,0,1,3.064-.311h8.254v2.986ZM63.548,21.253v-14h3.74v14ZM79.056,10.3V21.253H75.317V10.3H69.441V7.253h15.5V10.3Zm11.768,4.963a5.275,5.275,0,0,0,.162,1.432,1.85,1.85,0,0,0,.524.881,1.989,1.989,0,0,0,.943.448,6.992,6.992,0,0,0,1.425.122h7.1v3.108H93.112a12.32,12.32,0,0,1-2.777-.27,4.8,4.8,0,0,1-1.869-.836,3.234,3.234,0,0,1-1.053-1.431,5.833,5.833,0,0,1-.328-2.059v-9.4h3.739Zm12.817,5.991v-14h3.739v14Zm19.743,0-9.343-9.619v9.619H110.3v-14h4.062l9.353,9.659V7.253h3.719v14Zm10.733-8.661,7.66-5.339h5.008l-9.322,6.714,9.947,7.286h-5.452l-7.841-5.818v5.818h-3.759v-14h3.759Z"
                transform="translate(-45.995 -7.253)"
                fill="#fff"
                fill-rule="evenodd"
              />
            </g>
          </svg>

          <div class="link">fitlinkapp.com</div>
        </div>

        {{#each stats}}
          <div class="stat">
            <div class="stat-value">{{this.value}}</div>
            <div class="stat-label">{{this.label}}</div>
          </div>
        {{/each}}
      </div>
    </div>
  </body>
</html>`