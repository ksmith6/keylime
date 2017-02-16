# Keylime
Password Manager

Way back in 2012, I was learning about front-end and and back-end web development, and 
I was taking a Udacity course on building a web application with Steve Huffman. 

From the class, I learned the basics of authentication (hashing, etc) and basics of cryptography 
(using a salted hash, stretching, etc).  At my job, I maintained 30+ passwords for disparate systems, 
and they all had different refresh periods and requirements.  

I wanted to design a system that enabled me to simply remember a single _master_ password, would 
generate custom, high-entropy passwords for each system.

With this in mind, I developed the core of KeyLime one weekend in 2012.  
After I developed it, I learned of the existance of other password managers that 
worked in basically the same way.  But hey, I figured it out on my own and wrote my own as a fun exercise.

KeyLime is simply a static HTML file that sits on your machine.  It works by hashing a concatenated string the 
domain name, master password, and salt repeatedly using SHA-256.  The number of stretches is randomly determined 
based on a RNG whose seed is set based on the concatenated string itself.

Keylime stores the salt, domain names, and password settings locally in the browser using `localstorage`.  
No information is ever transmitted.  However, the downside of this approach is that your KeyLime usage is 
confined to a single browser on a single machine.  I never got around to implementing a server-side synchronization scheme.

I also added an import/export feature to export the password settings information to store in persistent storage (or Google Drive).
