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
        height: auto;
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
        min-height: 675px;
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

      .title {
        position: absolute;
        top: 0;
        right: 0;
        padding: 0.95238095em;
        padding-right: 1.42857143em;
        text-align: right;
        color: #fff;
        width: 100%;
        z-index: 100;
      }

      .title::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
        mix-blend-mode: multiply;
        filter: blur(1em);
        z-index: -1;
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

      {{#if sport}}
        <div class="title">{{sport}}</div>
      {{/if}}

      <div class="content">
        <div class="logo-container">
          <svg
            class="logo"
            xmlns="http://www.w3.org/2000/svg"
            width="142"
            height="44"
            viewBox="0 0 142 44"
          >
            <ellipse cx="22.1" cy="22" rx="22.1" ry="22" fill="#00e9d7" />
            <path
              d="M67.57,13.26H62.46l0-2.81h4.29a5.11,5.11,0,0,0,1.86-.29,2.2,2.2,0,0,0,1.08-.86A2.5,2.5,0,0,0,70,7.9a2.87,2.87,0,0,0-.35-1.5,2,2,0,0,0-1.08-.83,5.53,5.53,0,0,0-1.88-.26H63.88V22h-4.1V2.09h6.94a13.37,13.37,0,0,1,3.11.33,6.62,6.62,0,0,1,2.33,1,4.46,4.46,0,0,1,1.47,1.7,5.38,5.38,0,0,1,.5,2.4,4.63,4.63,0,0,1-.56,2.27,4.17,4.17,0,0,1-1.73,1.7,6.86,6.86,0,0,1-3.08.72ZM67.39,22h-6l1.6-3.2h4.45a4,4,0,0,0,1.77-.34,2.41,2.41,0,0,0,1-1,2.82,2.82,0,0,0,.33-1.38,3.58,3.58,0,0,0-.3-1.52,2.15,2.15,0,0,0-.93-1,3.49,3.49,0,0,0-1.7-.36H63.62l0-2.81h4.92l.94,1.1a5.51,5.51,0,0,1,2.93.65,3.86,3.86,0,0,1,1.62,1.71,5,5,0,0,1,.52,2.25,5.88,5.88,0,0,1-.83,3.23,5.07,5.07,0,0,1-2.45,1.95A10.24,10.24,0,0,1,67.39,22ZM82.76,2.09V22h-4.1V2.09Zm7.93,8.51v3.2h-9V10.6Zm1-8.51V5.31h-10V2.09Zm7.74,0V22H95.3V2.09Zm13.33,0V22h-4.09V2.09Zm6.13,0V5.31H102.6V2.09Z"
              fill="#fff"
            />
            <path
              d="M84.87,32.76q-.39,0-.69,0a1.39,1.39,0,0,0-.53.14.71.71,0,0,0-.32.34,1.28,1.28,0,0,0-.12.61v.3h6.18v1.76H83.21v3.28H81V33.69a3.12,3.12,0,0,1,.19-1.13,1.83,1.83,0,0,1,.63-.85A3.27,3.27,0,0,1,83,31.18,7.83,7.83,0,0,1,84.8,31h4.88v1.76Zm6.52,6.46V31H93.6v8.22Zm9.17-6.43v6.44H98.35V32.79H94.87V31H104v1.79Zm7,2.92a3,3,0,0,0,.1.84,1.07,1.07,0,0,0,.31.52,1.26,1.26,0,0,0,.56.26,4.68,4.68,0,0,0,.84.07h4.2v1.83h-4.65a7.57,7.57,0,0,1-1.65-.16,2.82,2.82,0,0,1-1.1-.5,1.89,1.89,0,0,1-.63-.84,3.49,3.49,0,0,1-.19-1.21V31h2.21Zm7.58,3.52V31h2.22v8.23Zm11.68,0-5.52-5.65v5.65H119V31h2.41L127,36.67V31h2.2v8.23Zm6.35-5.09L137.67,31h3l-5.51,3.94L141,39.22h-3.23l-4.64-3.41v3.41h-2.22V31h2.22Z"
              fill="#fff"
              fill-rule="evenodd"
            />
            <path
              d="M61.13,28.5h.81l-1.58,9.1L60.07,39h-.76Zm4.63,6.71,0,.15a6.62,6.62,0,0,1-.35,1.32,4.79,4.79,0,0,1-.64,1.23,3.18,3.18,0,0,1-1,.91,2.54,2.54,0,0,1-1.34.32,2.26,2.26,0,0,1-1.05-.24,2.45,2.45,0,0,1-.79-.63,2.76,2.76,0,0,1-.47-.92A3.2,3.2,0,0,1,60,36.27l.3-1.82a4.67,4.67,0,0,1,.42-1.13,3.77,3.77,0,0,1,.72-1,3.21,3.21,0,0,1,1-.66,2.73,2.73,0,0,1,1.18-.23,1.91,1.91,0,0,1,1.93,1.26A3.75,3.75,0,0,1,65.79,34,5.29,5.29,0,0,1,65.76,35.21Zm-.83.15,0-.15a5.27,5.27,0,0,0,.06-1,3.41,3.41,0,0,0-.16-1,1.53,1.53,0,0,0-.49-.76,1.42,1.42,0,0,0-1-.3,2.31,2.31,0,0,0-.9.16,2.81,2.81,0,0,0-.78.46,3.25,3.25,0,0,0-.6.68,3.19,3.19,0,0,0-.38.84l-.36,2.13a1.82,1.82,0,0,0,.23,1,1.88,1.88,0,0,0,.7.7,2.08,2.08,0,0,0,1,.26,2,2,0,0,0,1.09-.26,2.47,2.47,0,0,0,.77-.74,3.9,3.9,0,0,0,.5-1A6.41,6.41,0,0,0,64.93,35.36ZM70,38.23l3.38-6.62h.89l-4.5,8.58a5.64,5.64,0,0,1-.4.67,3.49,3.49,0,0,1-.49.58,2.06,2.06,0,0,1-.62.4,1.94,1.94,0,0,1-.78.16l-.32,0-.31-.06.05-.7.21,0a.58.58,0,0,0,.19,0,1.54,1.54,0,0,0,.79-.17,1.91,1.91,0,0,0,.58-.48,4.1,4.1,0,0,0,.45-.69Zm-1-6.63L70.29,38l.07.84-.62.33-1.5-7.56Z"
              fill="#00e9d7"
            />
          </svg>
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
