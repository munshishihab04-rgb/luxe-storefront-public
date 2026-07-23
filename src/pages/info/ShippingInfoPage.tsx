function InfoPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-black tracking-tight mb-8">{title}</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-5">
        {children}
      </div>
    </div>
  );
}

export function ShippingInfoPage() {
  return (
    <InfoPage title="Spedizioni & Consegne">
      <p>Spediamo in tutta Italia e in Europa. Ogni spedizione è completamente tracciata e assicurata.</p>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Tempi di Consegna</h2>
      <ul className="space-y-2">
        <li><strong className="text-foreground">Italia:</strong> 1-3 giorni lavorativi</li>
        <li><strong className="text-foreground">Europa:</strong> 3-7 giorni lavorativi</li>
        <li><strong className="text-foreground">Express:</strong> 24-48 ore (solo Italia, €12)</li>
      </ul>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Costi di Spedizione</h2>
      <p>La spedizione standard è <strong className="text-foreground">gratuita su tutti gli ordini</strong>. Per la spedizione express in Italia, il costo è di €12,00.</p>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Tracking</h2>
      <p>Riceverai una email con il link di tracking non appena il tuo ordine viene spedito. Puoi tracciare il tuo pacco in tempo reale.</p>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Packaging</h2>
      <p>Ogni prodotto viene imballato con cura, con imballo a prova di manomissione e materiali di protezione premium. I prodotti luxury vengono spediti con la loro scatola originale.</p>
    </InfoPage>
  );
}

export function ReturnsPage() {
  return (
    <InfoPage title="Resi & Cambi">
      <p>La tua soddisfazione è la nostra priorità. Accettiamo resi e cambi entro 14 giorni dalla data di consegna.</p>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Condizioni per il Reso</h2>
      <ul className="space-y-2">
        <li>Il prodotto deve essere nelle condizioni originali, non indossato</li>
        <li>Con tutti i tag e la scatola originale intatti</li>
        <li>Entro 14 giorni dalla data di consegna</li>
        <li>Con ricevuta o conferma d&apos;ordine</li>
      </ul>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Come Effettuare un Reso</h2>
      <ol className="space-y-2 list-decimal list-inside">
        <li>Contattaci a info@luxe.it o via WhatsApp</li>
        <li>Fornisci il numero d&apos;ordine e il motivo del reso</li>
        <li>Riceverai un&apos;etichetta di reso prepagata entro 24h</li>
        <li>Spedisci il prodotto con l&apos;etichetta fornita</li>
        <li>Il rimborso viene processato entro 5-7 giorni lavorativi</li>
      </ol>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Rimborso</h2>
      <p>Il rimborso viene effettuato con lo stesso metodo di pagamento utilizzato per l&apos;acquisto. I tempi di accredito dipendono dalla tua banca (generalmente 3-5 giorni lavorativi).</p>
    </InfoPage>
  );
}

export function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy">
      <p>LUXE. rispetta la tua privacy e si impegna a proteggere i tuoi dati personali conformemente al GDPR (Regolamento UE 2016/679).</p>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Dati Raccolti</h2>
      <p>Raccogliamo solo i dati necessari per elaborare i tuoi ordini e migliorare la tua esperienza di acquisto: nome, email, indirizzo di spedizione e dati di pagamento (gestiti in modo sicuro da Stripe).</p>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Utilizzo dei Dati</h2>
      <ul className="space-y-2">
        <li>Elaborazione degli ordini e spedizioni</li>
        <li>Comunicazioni relative agli ordini</li>
        <li>Newsletter (solo con consenso esplicito)</li>
        <li>Miglioramento dei servizi</li>
      </ul>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">I Tuoi Diritti</h2>
      <p>Hai il diritto di accedere, modificare, cancellare e portare i tuoi dati. Per esercitare questi diritti, contattaci a privacy@luxe.it.</p>
    </InfoPage>
  );
}

export function TermsPage() {
  return (
    <InfoPage title="Termini & Condizioni">
      <p>L&apos;utilizzo del sito web LUXE. e l&apos;acquisto di prodotti sono soggetti ai seguenti termini e condizioni.</p>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Accettazione dei Termini</h2>
      <p>Accedendo e utilizzando questo sito, accetti di essere vincolato da questi termini. Se non accetti, ti preghiamo di non utilizzare il sito.</p>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Prodotti e Prezzi</h2>
      <p>Ci riserviamo il diritto di modificare i prezzi in qualsiasi momento. I prezzi al momento dell&apos;ordine sono quelli che verranno addebitati. Tutti i prezzi includono IVA.</p>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Autenticità</h2>
      <p>Garantiamo l&apos;autenticità di ogni prodotto venduto. Tutti i prodotti vengono verificati dal nostro team di esperti prima della spedizione.</p>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Limitazione di Responsabilità</h2>
      <p>LUXE. non è responsabile per danni indiretti o consequenziali derivanti dall&apos;uso dei prodotti acquistati.</p>
    </InfoPage>
  );
}

export function AuthenticityPage() {
  return (
    <InfoPage title="Garanzia di Autenticità">
      <p className="text-foreground text-base font-semibold">Ogni prodotto venduto su LUXE. è 100% autentico e originale. La nostra garanzia è assoluta.</p>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Il Nostro Processo di Autenticazione</h2>
      <p>Ogni prodotto che riceviamo dai nostri fornitori passa attraverso un rigoroso processo di autenticazione a più livelli prima di essere messo in vendita.</p>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Cosa Controlliamo</h2>
      <ul className="space-y-2">
        <li><strong className="text-foreground">Materiali:</strong> Verifica della qualità e tipologia dei materiali</li>
        <li><strong className="text-foreground">Costruzione:</strong> Controllo delle cuciture, collanti e assemblaggi</li>
        <li><strong className="text-foreground">Loghi e etichette:</strong> Verifica della tipografia, posizionamento e qualità</li>
        <li><strong className="text-foreground">Codici seriali:</strong> Controllo dei numeri di serie e certificati</li>
        <li><strong className="text-foreground">Packaging:</strong> Verifica delle scatole e materiali originali</li>
      </ul>
      <h2 className="text-foreground font-black text-xl mt-6 mb-3">Se un Prodotto Non è Autentico</h2>
      <p>Nel caso estremamente improbabile in cui un prodotto non sia autentico, ti rimborsiamo l&apos;intero importo pagato più il 10% di compensazione per l&apos;inconveniente. Questo è il nostro impegno verso di te.</p>
    </InfoPage>
  );
}
