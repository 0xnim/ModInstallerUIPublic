import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
const { ipcRenderer, remote } = require('electron-renderer');
import './styles.css';
import toast, { Toaster } from 'solid-toast';
import Dialog from './components/Dialog';



function App() {
  const baseURL = 'https://api.0xnim.xyz';


  const [mods, setMods] = React.useState([]);
  const [installCheckboxes, setInstallCheckboxes] = React.useState({});
  const [selectedMod, setSelectedMod] = React.useState(null);
  const [selectedVersion, setSelectedVersion] = React.useState(null);
  const [modType, setModType] = useState('mod');
  const [search, setSearch] = useState('');

  const [showDialog, setShowDialog] = useState(false);
  const [selectedSort, setSelectedSort] = useState('Id');
  let [data, setData] = useState([]);

  

  React.useEffect(() => {
    fetch(`https://api.0xnim.xyz/api/mods`)
      .then(response => response.json())
      .then(data => setMods(data.data))
      .then(data => setData(data.data));
  }, []);

  const sortData = async (field) => {
    console.log(field)
    const sortedData = [...data];
    if (field === 'downloads') {
      sortedData.sort((a, b) => (a[field] > b[field]) ? -1 : 1);
    } else {
      sortedData.sort((a, b) => (a.id > b.id) ? 1 : -1);
    }
    setData(sortedData);
  }

  


  const handleSort = (sortType) => {
    setSelectedSort(sortType);
    const sortLowerCase = selectedSort.toLowerCase();
    sortData(sortLowerCase);
    setData
  }
  
  const handleCheckboxChange = (e, modId) => {
    setInstallCheckboxes({ ...installCheckboxes, [modId]: e.target.checked });
  };
  
  const handleRowClick = (mod, version) => {
    setSelectedMod(mod);
  };

  const getModVersions = async (modIdentifier) => {
    try {
        const response = await axios.get(`https://api.0xnim.xyz/api/versions/mod/${modIdentifier}`);
        const versions = response.data.data.map(version => version.version);
        return versions;
    } catch (error) {
        console.error(error);
    }
  };

  const filterVersion = (version) => {
    version = version.replace(/[^\d.]/g, "");
    return version;
  };

  const compareVersions = (version1, version2) => {
      // remove any non-numeric characters from the version strings
      version1 = filterVersion(version1);
      version2 = filterVersion(version2);
  
      // split the version strings by "." and convert them to numbers
      const v1 = version1.split(".").map(x => parseInt(x));
      const v2 = version2.split(".").map(x => parseInt(x));
      const maxLen = Math.max(v1.length, v2.length);
      // add empty values to the shorter array
      while (v1.length < maxLen) v1.push(0);
      while (v2.length < maxLen) v2.push(0);
    
      for (let i = 0; i < maxLen; i++) {
          if (v1[i] !== v2[i]) {
              return v1[i] > v2[i] ? version1 : version2;
          }
      }
      return version1;
  };
  
  const findLargestVersion = (versions) => {
      let largestVersion = versions[0];
      let originalVersion = versions[0];
      let i = -1;
      for (let version of versions) {
        largestVersion = compareVersions(largestVersion, version);
        version = filterVersion(version);
        if (largestVersion === version) {
          console.log(largestVersion, version);
          i = i+1;
        }
      }
      originalVersion = versions[i];
      return originalVersion;
  }

  const getVersionByIdentifier = async (version, identifier) => {
    const versionsdata = await axios.get(`https://api.0xnim.xyz/api/versions/mod/${identifier}`);
    const versions = versionsdata.data.data;
    const output = versions.find(v => v.version === version && v.identifier === identifier);
    return output;
  }
  
  const handleApply = async () => {
    toast.success('Toast launched successfully!');
    const selectedMods = Object.keys(installCheckboxes).filter(id => installCheckboxes[id]);
    const downloadPromises = [];
    for (const id of selectedMods) {
      const res = await axios.get(`https://api.0xnim.xyz/api/mods/${id}`);
      const identifier = res.data.data.identifier;
      const versions = await getModVersions(identifier);
      const largestVersion = findLargestVersion(versions);
      const selectedVersion = await getVersionByIdentifier(largestVersion, identifier);
      downloadPromises.push(ipcRenderer.invoke('download-item', selectedVersion.download, selectedVersion.hash, selectedVersion.type));
      await Promise.all(downloadPromises);
      console.log(selectedVersion.download, selectedVersion.hash);
    } 
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
  
    if (searchValue === '') {
      fetch(`https://api.0xnim.xyz/api/mods`)
        .then(response => response.json())
        .then(data => setMods(data.data));
    } else {
      fetch(`https://api.0xnim.xyz/api/mods/search/name/${searchValue}`)
        .then(response => response.json())
        .then(data => setMods(data.data));
    }
  }


  return (
    <div>
      <nav>
        <button value="mod" onClick={() => setModType("mod")}>Mods</button>
        <button value="pack" onClick={() => setModType("pack")}>Packs</button>
        <button value="texture" onClick={() => setModType("texture")}>Textures</button>
      </nav>
      <div>
        {/* Render the appropriate content based on the mod type */}
        {modType === 'mod' && <p />}
        {modType === 'pack' && <p />}
        {modType === 'texture' && <p />}
      </div>
      <div class="search-container">
        <label>Search:</label>
        <input value={search} onChange={handleSearch} />
      </div>



      {showDialog && (
        <Dialog handleSort={handleSort} />
      )}

      <table class="half">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>Install</th>
            <th onClick={() => handleSort('name')}>Name</th>
            <th onClick={() => handleSort('author')} >Author</th>
            <th onClick={() => handleSort('downloads')}>Downloads</th>
          </tr>
        </thead>
        <tbody>
        {mods.map((mod, index) => {
          console.log()
          if (mod.type === modType) {
            return (
              <tr key={index} onClick={() => handleRowClick(mod)}>
                <td>
                  <input
                    type="checkbox"
                    className="checkbox"
                    onChange={e => handleCheckboxChange(e, mod.id)}
                    checked={installCheckboxes[mod.id] || false}
                  />
                </td>
                <td>{mod.name}</td>
                <td>{mod.author}</td>
                <td>{mod.downloads}</td>
              </tr>
            )
          }
          return null;
        })}
        </tbody>
      </table>
      {selectedMod && (
        <div className="side-window">
          <h2>{selectedMod.name}</h2>
          <p>{selectedMod.type === 'mod' ? 'Mod' : 'Pack'}</p>
          <p class="checkmark">{selectedMod.status === 1 ? 'Maintained: ' : 'Not Maintained: '}</p>
          <p>{selectedMod.type === 'mod' ? 'Mod' : 'Pack'}</p>
          <p>Description: {selectedMod.description}</p>
          
        </div>
      )}
      <div class="center">
        <button onClick={() => handleApply()} class="apply-btn">Apply</button>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
