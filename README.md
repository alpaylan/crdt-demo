# Paper Stacks: Stacking CRDT's

In this episode of Paper Stacks, Alperen Keles and Ozan Akin will be discussing
Real-Time Distributed State Sharing for Collaborative Applications using Conflict-Free
Replicated Data Types(CRDTs).

Sharing state between multiple servers and clients is extremely common today. When
multiple users make concurrent updates on a shared data structure, the applications need 
conflict resolution strategies to ensure all users agree on the final state. 

CRDTs are one such mechanism for handling distributed state; the differentiating factors
for CRDTs are (1) they don't need a central server, (2) they are highly fault-tolerant, allowing
users to work offline, and sync their work at arbitrary intervals.

Within the episode, we will base our discussions on the 2011 paper by Marc Shapiro, discuss the 
usage of CRDTs in collaborative text editing in Zed Code Editor, collaborative canvases such as
Excalidraw and Figma, and provide live demos on the internal workings of CRDTs.

Paper Link: https://inria.hal.science/inria-00555588/document


- https://www.cs.cmu.edu/~csd-phd-blog/2023/collaborative-data-design/
- https://github.com/ljwagerfield/crdt
- https://mattweidner.com/2023/09/26/crdt-survey-1.html
- https://driftingin.space/posts/you-might-not-need-a-crdt
- https://zed.dev/blog/crdts
- https://en.wikipedia.org/wiki/Operational_transformation
- https://github.com/xi-editor/xi-editor/issues/1187#issuecomment-491473599
- https://crdt.tech