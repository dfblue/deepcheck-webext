import 'core-js/stable'
import 'regenerator-runtime/runtime'
import React from 'react'
import ReactDOM from 'react-dom'
import browser from 'webextension-polyfill'
import difference from 'lodash/difference'
import Version from '../utils/Version'
import '../css/main.css'

class Popup extends React.Component {
  constructor () {
    super()
    this.state = {
      enabled: false,
      disabledDomains: [],
      url: 'https://example.com'
    }
  }

  async componentDidMount () {
    const { enabled, disabledDomains } = await browser.storage.sync.get(['enabled', 'disabledDomains'])
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const { url } = tabs[0]
    this.setState({
      enabled,
      disabledDomains,
      url
    })
  }

  matchingDisabledDomains (hostname, disabledDomains) {
    return disabledDomains.filter(dd => hostname.includes(dd))
  }

  domainEnabled (hostname, disabledDomains) {
    return this.matchingDisabledDomains(hostname, disabledDomains).length === 0
  }

  toggleDomain () {
    this.setState((prevState) => {
      const { disabledDomains, url } = prevState
      const { hostname } = new URL(url)
      if (this.domainEnabled(hostname, disabledDomains)) { // disable it
        disabledDomains.push(hostname)
        return { disabledDomains }
      } else { // enable it / remove disable
        const newDisabledDomains = difference(disabledDomains, this.matchingDisabledDomains(hostname, disabledDomains))
        return { disabledDomains: newDisabledDomains }
      }
    })
  }

  async componentDidUpdate (prevProps, prevState) {
    const { enabled, disabledDomains } = this.state
    await browser.storage.sync.set({ enabled, disabledDomains })
  }

  render () {
    const { url, disabledDomains } = this.state
    const { hostname } = new URL(url)

    return (
      <div className="container">
        <h1>Deepcheck</h1>
        <p>The internet&apos;s missing reputation checker</p>
        <br />
        <p>› {hostname}</p>
        <div className="btn-group-toggle" data-toggle="buttons">
          <label className="btn btn-primary btn-sm">
            <input type="checkbox" checked={this.domainEnabled(hostname, disabledDomains)} onChange={() => {
              this.toggleDomain()
            }} />
            {this.domainEnabled(hostname, disabledDomains) ? 'enabled' : 'disabled'}
          </label>
        </div>
        <br />
        <Version />
      </div>
    )
  }
}

ReactDOM.render(<Popup />, document.getElementById('popup'))
