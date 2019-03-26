srpm:
	rm -rf /tmp/_topdir
	rm -rf /tmp/scratch
	mkdir -p /tmp/_topdir/SOURCES
	mkdir -p /tmp/scratch
	cp -r ./* /tmp/scratch
	yum-builddep -y /tmp/scratch/iml-old-gui.spec
	bash -c 'cd /tmp/scratch && npm i && npm pack'
	cp /tmp/scratch/iml-old-gui*.tgz /tmp/_topdir/SOURCES
	rpmbuild -bs --define "_topdir /tmp/_topdir" /tmp/scratch/iml-old-gui.spec
	cp -r /tmp/_topdir/SRPMS/* $(outdir)