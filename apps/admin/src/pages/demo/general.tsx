import Dashboard from '../../components/layouts/Dashboard'

export default function page() {
  const grid = [
    [1],
    [1, 2],
    [1, 2, 3],
    [1, 2, 3, 4],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  ]

  return (
    <Dashboard title="General" linkPrefix="/demo">
      <p className="h6 color-light-grey">Typography</p>
      <div className="row ai-c">
        <div className="col-2">
          <h1>&lt;h1&gt; / .h1</h1>
        </div>
        <div className="col">
          <h1 className="light">.light</h1>
        </div>
      </div>
      <div className="row ai-c">
        <div className="col-2">
          <h2>&lt;h2&gt; / .h2</h2>
        </div>
        <div className="col">
          <h2 className="light">.light</h2>
        </div>
      </div>
      <div className="row ai-c">
        <div className="col-2">
          <h3>&lt;h3&gt; / .h3</h3>
        </div>
        <div className="col">
          <h3 className="light">.light</h3>
        </div>
      </div>
      <div className="row ai-c">
        <div className="col-2">
          <h4>&lt;h4&gt; / .h4</h4>
        </div>
        <div className="col">
          <h4 className="light">.light</h4>
        </div>
      </div>
      <div className="row ai-c">
        <div className="col-2">
          <h5>&lt;h5&gt; / .h5</h5>
        </div>
        <div className="col">
          <h5 className="light">.light</h5>
        </div>
      </div>
      <div className="row ai-c">
        <div className="col-2">
          <h6>&lt;h6&gt; / .h6</h6>
        </div>
        <div className="col">
          <h6 className="light">.light</h6>
        </div>
      </div>
      <p>
        &lt;p&gt; Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
        do eiusmod tempor{' '}
        <strong>incididunt ut labore et dolore magna aliqua</strong>.{' '}
        <em>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat
        </em>
        . Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <ul>
        <li>List Item</li>
        <li>List Item</li>
        <li>List Item</li>
        <li>List Item</li>
      </ul>
      <ol>
        <li>List Item</li>
        <li>List Item</li>
        <li>
          Sub List
          <ul>
            <li>List Item</li>
            <li>List Item</li>
            <li>List Item</li>
            <li>List Item</li>
          </ul>
        </li>

        <li>List Item</li>
      </ol>

      <hr className="mt-8" />
      <p className="h6 color-light-grey">Helper Classes</p>
      <p>
        Margins and padding can be added in &frac12;rem intervals. Where{' '}
        <strong>x = 3</strong> is equal to <strong>1.5rem</strong>
      </p>

      <div className="row ai-c">
        <div className="col-2">
          <pre>
            .m-<em>x</em>
          </pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              margin: <em>(x/2)*</em>1rem;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>
            .mx-<em>x</em>
          </pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              margin-left: <em>(x/2)*</em>1rem;
              <br />
              margin-right: <em>(x/2)*</em>1rem;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>
            .my-<em>x</em>
          </pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              margin-top: <em>(x/2)*</em>1rem;
              <br />
              margin-bottom: <em>(x/2)*</em>1rem;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>
            .mt-<em>x</em>
            <br />
            .mr-<em>x</em>
            <br />
            .mb-<em>x</em>
            <br />
            .ml-<em>x</em>
          </pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              margin-top: <em>(x/2)*</em>1rem;
              <br />
              margin-right: <em>(x/2)*</em>1rem;
              <br />
              margin-bottom: <em>(x/2)*</em>1rem;
              <br />
              margin-left: <em>(x/2)*</em>1rem;
            </code>
          </pre>
        </div>
        <div className="col-12">
          <p>
            Any of the above can include <strong>small</strong>,{' '}
            <strong>medium</strong> or <strong>large</strong> breakpoints in the
            class name, e.g. &nbsp;
            <code>&lt;div className="mt-2 mt-md-4 mt-lg-8"&gt;...</code>
          </p>
        </div>

        <div className="col-2">
          <pre>
            .p-<em>x</em>
          </pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              padding: <em>(x/2)*</em>1rem;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>
            .px-<em>x</em>
          </pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              padding-left: <em>(x/2)*</em>1rem;
              <br />
              padding-right: <em>(x/2)*</em>1rem;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>
            .py-<em>x</em>
          </pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              padding-top: <em>(x/2)*</em>1rem;
              <br />
              padding-bottom: <em>(x/2)*</em>1rem;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>
            .pt-<em>x</em>
            <br />
            .pr-<em>x</em>
            <br />
            .pb-<em>x</em>
            <br />
            .pl-<em>x</em>
          </pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              padding-top: <em>(x/2)*</em>1rem;
              <br />
              padding-right: <em>(x/2)*</em>1rem;
              <br />
              padding-bottom: <em>(x/2)*</em>1rem;
              <br />
              padding-left: <em>(x/2)*</em>1rem;
            </code>
          </pre>
        </div>
        <div className="col-12">
          <p>
            Any of the above can include <strong>small</strong>,{' '}
            <strong>medium</strong> or <strong>large</strong> breakpoints in the
            class name, e.g. &nbsp;
            <code>&lt;div className="pt-2 pt-md-4 pt-lg-8"&gt;...</code>
          </p>
        </div>

        <div className="col-2">
          <pre>.text-left</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">text-align: left;</code>
          </pre>
        </div>
        <div className="col-2">
          <pre>.text-center</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">text-align: center;</code>
          </pre>
        </div>
        <div className="col-2">
          <pre>.text-right</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">text-align: right;</code>
          </pre>
        </div>
        <div className="col-12">
          <p>
            Any of the above can include <strong>small</strong>,{' '}
            <strong>medium</strong> or <strong>large</strong> breakpoints in the
            class name, e.g. &nbsp;
            <code>&lt;div className="text-center text-md-left"&gt;...</code>
          </p>
        </div>
        <div className="col-2">
          <pre>.block-img</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              display: block;
              <br />
              max-width: 100%;
              <br />
              height: auto;
              <br />
              margin: 0 auto;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>.block</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">display: block;</code>
          </pre>
        </div>
        <div className="col-2">
          <pre>.relative</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">position: relative;</code>
          </pre>
        </div>
        <div className="col-2">
          <pre>.box-shadow</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              box-shadow: 5px 5px 10px 0 rgba(0, 0, 0, 0.1);
            </code>
          </pre>
        </div>
      </div>

      <hr className="mt-8" />
      <p className="h6 color-light-grey">Colours</p>

      <div className="row ai-c">
        <div className="col-3">
          <pre>$primary</pre>
        </div>
        <div className="col-3 mb-1">
          <div
            className="bg-primary p-2 box-shadow"
            style={{ width: '100px', borderRadius: '0.5rem' }}
          />
        </div>
        <div className="col-3">
          <pre>
            <code>.text-primary</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>
            <code>.bg-primary</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>$dark</pre>
        </div>
        <div className="col-3 mb-1">
          <div
            className="bg-dark p-2 box-shadow"
            style={{ width: '100px', borderRadius: '0.5rem' }}
          />
        </div>
        <div className="col-3">
          <pre>
            <code>.text-dark</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>
            <code>.bg-dark</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>$darkGrey</pre>
        </div>
        <div className="col-3 mb-1">
          <div
            className="bg-dark-grey p-2 box-shadow"
            style={{ width: '100px', borderRadius: '0.5rem' }}
          />
        </div>
        <div className="col-3">
          <pre>
            <code>.text-dark-grey</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>
            <code>.bg-dark-grey</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>$grey</pre>
        </div>
        <div className="col-3 mb-1">
          <div
            className="bg-grey p-2 box-shadow"
            style={{ width: '100px', borderRadius: '0.5rem' }}
          />
        </div>
        <div className="col-3">
          <pre>
            <code>.text-grey</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>
            <code>.bg-grey</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>$lightGrey</pre>
        </div>
        <div className="col-3 mb-1">
          <div
            className="bg-light-grey p-2 box-shadow"
            style={{ width: '100px', borderRadius: '0.5rem' }}
          />
        </div>
        <div className="col-3">
          <pre>
            <code>.text-light-grey</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>
            <code>.bg-light-grey</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>$white</pre>
        </div>
        <div className="col-3 mb-1">
          <div
            className="bg-white p-2 box-shadow"
            style={{ width: '100px', borderRadius: '0.5rem' }}
          />
        </div>
        <div className="col-3">
          <pre>
            <code>.text-white</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>
            <code>.bg-white</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>$grey-50</pre>
        </div>
        <div className="col-3 mb-1">
          <div
            className="bg-grey-50 p-2 box-shadow"
            style={{ width: '100px', borderRadius: '0.5rem' }}
          />
        </div>
        <div className="col-3">
          <pre>
            <code>.text-grey-50</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>
            <code>.bg-grey-50</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>$grey-100</pre>
        </div>
        <div className="col-3 mb-1">
          <div
            className="bg-grey-100 p-2 box-shadow"
            style={{ width: '100px', borderRadius: '0.5rem' }}
          />
        </div>
        <div className="col-3">
          <pre>
            <code>.text-grey-100</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>
            <code>.bg-grey-100</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>$grey-200</pre>
        </div>
        <div className="col-3 mb-1">
          <div
            className="bg-grey-200 p-2 box-shadow"
            style={{ width: '100px', borderRadius: '0.5rem' }}
          />
        </div>
        <div className="col-3">
          <pre>
            <code>.text-grey-200</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>
            <code>.bg-grey-200</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>$grey-300</pre>
        </div>
        <div className="col-3 mb-1">
          <div
            className="bg-grey-300 p-2 box-shadow"
            style={{ width: '100px', borderRadius: '0.5rem' }}
          />
        </div>
        <div className="col-3">
          <pre>
            <code>.text-grey-300</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>
            <code>.bg-grey-300</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>$red</pre>
        </div>
        <div className="col-3 mb-1">
          <div
            className="bg-red p-2 box-shadow"
            style={{ width: '100px', borderRadius: '0.5rem' }}
          />
        </div>
        <div className="col-3">
          <pre>
            <code>.text-red</code>
          </pre>
        </div>
        <div className="col-3">
          <pre>
            <code>.bg-red</code>
          </pre>
        </div>
      </div>

      <hr className="mt-8" />
      <p className="h6 color-light-grey">Grid</p>
      <p>Basic grid structure</p>
      <pre>
        <code
          className="block"
          dangerouslySetInnerHTML={{
            __html: `&lt;div className="row"&gt;\n  &lt;div className="col"&gt;...&lt;/div&gt;\n  &lt;div className="col"&gt;...&lt;/div&gt;\n  &lt;div className="col"&gt;...&lt;/div&gt;\n&lt;/div&gt;`
          }}
        />
      </pre>

      <p className="mt-2">
        Alignment (applied to <strong>.row</strong>)
      </p>
      <div className="row ai-c">
        <div className="col-2">
          <pre>
            .ai-s
            <br />
            .ai-c
            <br />
            .ai-e
          </pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              align-items: flex-start;
              <br />
              align-items: center;
              <br />
              align-items: flex-end;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>
            .ac-s
            <br />
            .ac-c
            <br />
            .ac-e
          </pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              align-content: flex-start;
              <br />
              align-content: center;
              <br />
              align-content: flex-end;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>
            .ji-s
            <br />
            .ji-c
            <br />
            .ji-e
          </pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              justify-items: flex-start;
              <br />
              justify-items: center;
              <br />
              justify-items: flex-end;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>
            .jc-s
            <br />
            .jc-c
            <br />
            .jc-e
            <br />
            .jc-sa
          </pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              justify-content: flex-start;
              <br />
              justify-content: center;
              <br />
              justify-content: flex-end;
              <br />
              justify-content: space-around;
            </code>
          </pre>
        </div>
      </div>

      <p className="mt-2">
        Alignment (applied to <strong>.col</strong>)
      </p>
      <div className="row ai-c">
        <div className="col-2">
          <pre>.al</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              margin-left: 0;
              <br />
              margin-right: auto;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>.ar</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              margin-left: auto;
              <br />
              margin-right: 0;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>.auto</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">margin: auto;</code>
          </pre>
        </div>
      </div>

      <p className="mt-2">Column sizing</p>
      <div className="row ai-c">
        <div className="col-2">
          <pre>.al</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              margin-left: 0;
              <br />
              margin-right: auto;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>.ar</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">
              margin-left: auto;
              <br />
              margin-right: 0;
            </code>
          </pre>
        </div>
        <div className="col-2">
          <pre>.auto</pre>
        </div>
        <div className="col-10">
          <pre>
            <code className="block">margin: auto;</code>
          </pre>
        </div>
      </div>

      <p className="mt-2">Autosizing Sizing</p>

      {grid.map((r, i) => (
        <div className="row" key={`arow-${i}`}>
          {r.map((c) => (
            <div className="col my-1" key={`acol-${c}`}>
              <div className="bg-grey-200 p-2">
                <pre>.col</pre>
              </div>
            </div>
          ))}
        </div>
      ))}

      <p className="mt-2">Responsive Sizing</p>
      <p>
        Using &nbsp;
        <code>
          .col-<em>[1-12]</em>
        </code>{' '}
        and breaking with &nbsp;
        <code>
          .col-<em>[sm/md/lg/xl]</em>-<em>[1-12]</em>
        </code>
      </p>

      {grid.map((r, i) => (
        <div className="row" key={`brow-${i}`}>
          {r.map((c) => (
            <div
              className={`col-12 my-1 col-lg-${12 / r.length}`}
              key={`bcol-${c}`}>
              <div className="bg-grey-200 py-4"></div>
            </div>
          ))}
        </div>
      ))}
    </Dashboard>
  )
}
