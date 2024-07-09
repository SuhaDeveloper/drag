detectAdBlock(): void {
    const adFrame = document.getElementById('ad-frame') as HTMLIFrameElement;

    if (adFrame) {
      this.renderer.listen(adFrame, 'load', () => {
        console.log('Iframe loaded successfully. No ad blocker detected.');
      });

      this.renderer.listen(adFrame, 'error', () => {
        console.log('Iframe failed to load. Ad blocker detected.');
        this.showPopup();
      });

      // Additional check for certain ad blockers that may not trigger 'error' event
      setTimeout(() => {
        if (adFrame.contentDocument?.body?.childElementCount === 0) {
          console.log('Iframe content blocked. Ad blocker detected.');
          this.showPopup();
        }
      }, 3000); // Adjust the timeout as necessary
    }
  }

  showPopup(): void {
    // Logic to show popup
    alert('Ad blocker detected! Please disable it to support us.');
  }
