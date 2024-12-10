import React, { useEffect, useState } from 'react';
import './App.css';

import { SCHEMA_INRUPT, RDF, AS } from '@inrupt/vocab-common-rdf';

import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  fetch,
  Session,
} from '@inrupt/solid-client-authn-browser';

import {
  getPodUrlAll,
  getSolidDataset,
  getThing,
  createSolidDataset,
  saveSolidDatasetAt,
  createThing,
  addUrl,
  addStringNoLocale,
  setThing,
  getStringNoLocale,
} from '@inrupt/solid-client';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const exec = async () => {
      await handleIncomingRedirect();

      const session = getDefaultSession();
      setSession({ ...session } as Session);
    };

    exec();
  }, []);

  useEffect(() => {
    getItems();
  }, [profile]);

  const handleLogin = async () => {
    return login({
      oidcIssuer: 'https://login.inrupt.com',
      redirectUrl: new URL('/', window.location.href).toString(),
      clientName: 'UFABC - Solid App',
    });
  };

  const handleConnect = async () => {
    const mypods = await getPodUrlAll(session!.info.webId!, { fetch: fetch });

    const profileUrl = `${mypods[0]}customProfile`;
    setProfileUrl(profileUrl);

    try {
      const profile = await getSolidDataset(profileUrl, { fetch: fetch });
      setProfile(profile);
    } catch (error: any) {
      console.log(error);

      if (typeof error.statusCode === 'number' && error.statusCode === 404) {
        const newProfile = createSolidDataset();

        await saveSolidDatasetAt(profileUrl, newProfile, { fetch: fetch });

        const profile = await getSolidDataset(profileUrl, { fetch: fetch });
        setProfile(profile);
      }
    }
  };

  const handleSave = async () => {
    let profileName = createThing({ name: 'User Name' });
    profileName = addUrl(profileName, RDF.type, AS.Article);
    profileName = addStringNoLocale(profileName, SCHEMA_INRUPT.name, name);
    let newProfile = setThing(profile, profileName);

    let profileEmail = createThing({ name: 'User Email' });
    profileEmail = addUrl(profileEmail, RDF.type, AS.Article);
    profileEmail = addStringNoLocale(profileEmail, SCHEMA_INRUPT.email, email);
    newProfile = setThing(newProfile, profileEmail);

    await saveSolidDatasetAt(profileUrl!, newProfile, { fetch: fetch });

    window.alert('Saved!');
  };

  const getItems = async () => {
    const nameThing = getThing(profile!, `${profileUrl}#User%20Name`);
    const emailThing = getThing(profile!, `${profileUrl}#User%20Email`);

    const savedName = getStringNoLocale(nameThing!, SCHEMA_INRUPT.name);
    const savedEmail = getStringNoLocale(emailThing!, SCHEMA_INRUPT.email);

    setName(savedName ?? '');
    setEmail(savedEmail ?? '');
  };

  if (!session || !session.info.isLoggedIn) {
    return (
      <>
        <button onClick={() => handleLogin()}>Login</button>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <button onClick={handleConnect}>Connect to Pod</button>
      </>
    );
  }

  return (
    <>
      <h1>UFABC Solid Demo</h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <span>Name:</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span>Email:</span>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <button onClick={handleSave} style={{ margin: 16, width: '100%' }}>
        Save
      </button>
    </>
  );
}

export default App;
